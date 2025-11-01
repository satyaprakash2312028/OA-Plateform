const {Problem} = require("../models/problem.model.js");
const {Mcq} = require("../models/mcq.model.js");
const {McqSubmission} = require("../models/mcqSubmission.model.js");
const {Submission} = require("../models/submission.model.js");
const {Registration} = require("../models/registration.model.js");
const { Assessment } = require("../models/assessment.model.js");
const {TeamScore} = require("../models/teamScore.model.js");
const {Team} = require("../models/team.model.js");
const {sendSubmissionToQueue} = require("../lib/queueManager.js");

const rejudge = async(req, res) =>{
    try{
        const problemId = req.params.id;
        const submissions = await Submission.find({problem: problemId});
        for(const submission of submissions){
            submission.status = "Pending";
            await submission.save();
            await sendSubmissionToQueue(submission);
        }
        res.status(200).json({message: "Rejudge initiated for all submissions of the problem."});
    }catch(error){
        console.log("Error in rejudge controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ messsage: "All fields are required for login" });
        if (password.length < 6) return res.status(400).json({ messsage: "Password length must be greater than 5" });
        const user = await User.find({ email });
        if (!user || user._id!=process.env.ADMIN_ID || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ messsage: "Invalid login credentials" });
        generateAdminToken(user._id, res);
        res.status(201).json({message : "Admin logged in sucessfully"});
    }catch(error){
        console.log("Error in login controller ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const uploadProblem = async(req, res) =>{ 
    try{
        const { name, timeLimit, memoryLimit, htmlDescription, isPrivate, interactor, checker, assessment, zipfile } = req.body;
        // check with zod
        const newProblem = new Problem({
            name,
            timeLimit,
            memoryLimit,
            htmlDescription,
            isPrivate,
            interactor,
            checker,
            assessment
        });
        if(newProblem) await newProblem.save();
        else return res.status(400).json({message: "Problem Creation failed."});
        // todo: Add actual upload of zipfile
        const newTest = new Test({
            problem: newProblem._id,
            path: "sasasas"
        });
        if(newTest) await newTest.save();
        else res.status(400).json({message: "Test upload failed"});
        res.status(201).json({message: "Problem uploaded sucessfully"});
    }catch(error){
        console.log("Error while uploading problem");
        return res.status(500).json({message: "Internal Server Error"});
    }

}

