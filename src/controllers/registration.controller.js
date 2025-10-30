const { generateToken} = require("../lib/utils.js");
const {User} = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const {cloudinary} = require("../lib/cloudinary.js");
const {Assessment} = require("../models/assessment.model.js");
const {Registration} = require("../models/registration.model.js");
const {Team} = require("../models/team.model.js");

const register = async(req, res) => {
    try{
        const {teamName, assessmentId, existingTeamID} = req.body;
        const user = req.user;
        if(teamName.trim().length<=0) return res.status(400).json({ message: "Team name isn't provided." });
        if(assessmentId.trim().length<=0) return res.status(400).json({ message: "Assessment ID isn't provided." });
        const assessment = await Assessment.findById(assessmentId);
        if(!assessment) return res.status(400).json({ message: "Assessment ID is wrong." });
        let teamID;
        if(!existingTeamID){
            const team = await Team.findOne({name: teamName});
            if(!team){
                const newTeam = new Team({
                    name: teamName,
                    leader: user._id
                });
                if(!newTeam) return res.status(500).json({message: "Not able to create the team. Try using different name."});
                await newTeam.save();
                teamID = newTeam._id;
            }else{
                return res.status(400).json({ message: "Team name already exists. Please choose a different name or join existing team." });
            }
        }else{
            const team = await Team.findById(existingTeamID);
            if(!team) return res.status(400).json({ message: "Team ID is wrong." });
            teamID = team._id;
        }
        const newRegistration = new Registration({
            assessment: assessmentId,
            team: teamID,
            user: user._id,
            isPending: false
        });
        await newRegistration.save();
        res.status(201).json(newRegistration.toJSON);
    }catch(error){
        console.log("Error in register controller.");
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {register};


