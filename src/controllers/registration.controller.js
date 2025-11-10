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
            const team = await Team.findOne({name: teamName, assessment:assessmentId});
            if(!team){
                const newTeam = new Team({
                    name: teamName,
                    leader: user._id,
                    assessment: assessmentId
                });
                if(!newTeam) return res.status(500).json({message: "Not able to create the team. Try using different name."});
                await newTeam.save();
                teamID = newTeam._id;
            }else{
                return res.status(400).json({ message: "Team name already exists. Please choose a different name or join existing team." });
            }
        }else{
            const team = await Team.findById({team:existingTeamID, assessment: assessmentId});
            if(!team) return res.status(400).json({ message: "Team ID is wrong." });
            const memeberCount = await Registration.find({team:teamID, assessment: assessmentId});
            if(memeberCount.length >= assessment.maxTeamSize) return res.status(400).json({message: "Max team size reached already"});
            teamID = team._id;
        }
        const newRegistration = new Registration({
            assessment: assessmentId,
            team: teamID,
            user: user._id,
            isPending: false
        });
        if(newRegistration) await newRegistration.save();
        else return res.status(400).json({ message: "Invalid Attempt..." });
        res.status(201).json(newRegistration.toJSON);
    }catch(error){
        console.log("Error in register controller.");
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getSelectedTeams = async (req, res) => {
    try {
        const { assessmentId } = req.body; // Or req.params if using URL parameters
        if (!assessmentId) return res.status(400).json({ message: "Assessment ID is required" });

        // Step 1: Fetch top scores, selecting only team ID and score
        const topScores = await TeamScore.find({ assessment: assessmentId })
            .sort({ score: -1 }) // Sort descending by score
            .limit(100)          // Limit to top 100
            .select("score team") // Select only needed fields
            .lean();             // Use lean() for performance

        if (!topScores || topScores.length === 0) {
            return res.status(200).json({ selectedTeams: [] }); // Return empty if no scores found
        }

        // Step 2: Extract unique team IDs
        const teamIds = topScores.map(score => score.team);

        // Step 3: Fetch all relevant team details in ONE query
        const teams = await Team.find({ _id: { $in: teamIds } })
            .select("name") // Select only the name
            .lean();

        // Step 4: Create a lookup map for team names { teamId: teamName }
        const teamNameMap = teams.reduce((map, team) => {
            map[team._id.toString()] = team.name;
            return map;
        }, {});

        // Step 5: Combine scores with team names
        const selectedTeamsWithNames = topScores.map(score => ({
            teamName: teamNameMap[score.team.toString()] || 'Unknown Team', // Handle case where team might be deleted
            score: score.score,
            // Include teamId if needed by frontend:
            // teamId: score.team.toString() 
        }));

        res.status(200).json({ selectedTeams: selectedTeamsWithNames }); // Corrected key to match original code

    } catch (error) {
        console.log("Error in getSelectedTeams controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = {register, getSelectedTeams};


