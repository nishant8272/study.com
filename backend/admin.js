const {Router } = require("express");
const jwt = require("jsonwebtoken");
const adminRoute= Router();
const {adminModel } =require("./db/admin");
const { userModel } = require("./db/user");
const { courseModel } = require("./db/courses");
const { contactModel } = require("./db/contact");
const { adminAuth } = require("./auth/adminAuth");

//register admin
adminRoute.post("/register", async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        if(!username || !email || !password || !firstName) {
            return res.status(400).json({
                "msg": "all fields are required"
            });
        }

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ email: email });
        if (existingAdmin) {
            return res.status(400).json({
                "msg": "admin with this email already exists"
            });
        }

        const admin = new adminModel({
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
        });

        await admin.save();

        const token = jwt.sign({ username, email }, process.env.JWT_SECRET_ADMIN, { expiresIn: '24h' });
        return res.json({
            "msg": "admin registered successfully",
            "token": token,
            "admin": {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName
            }
        });
    } catch (error) {
        console.error("Admin registration error:", error);
        return res.status(500).json({
            "msg": "internal server error during registration"
        });
    }
})

//login admin

adminRoute.post("/login", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({
                "msg" : "all fields are required"
            });
        }

        // Check if admin exists
        const admin = await adminModel.findOne({
            $and: [
                { email: email },
                { username: username },
                { password: password }
            ]
        });

        if (!admin) {
            return res.status(401).json({
                "msg": "invalid admin credentials"
            });
        }

        const token = jwt.sign({ username, email }, process.env.JWT_SECRET_ADMIN, { expiresIn: '24h' });
        return res.json({
            "msg": "admin login successfully",
            "token": token
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            "msg": "internal server error"
        });
    }
})

//get all courses post by admin
adminRoute.get("/course",adminAuth,async(req,res)=>{
    try {
        // First try to get courses by this admin

        const admin = await adminModel.findOne({email:req.email});
       
        if (!admin) {
            console.log("Admin not found for email:", req.email);
            return res.status(404).json({
                "msg": "admin not found"
            });
        }

        // First try to get courses by this admin
        let courses = await courseModel.find({ creatorId: admin._id });
       
        // If no courses found by creatorId, check if courses exist without creatorId
        if (courses.length === 0) {
           
            const allCourses = await courseModel.find({});

            // For existing courses without creatorId, assign them to this admin
            const coursesWithoutCreator = await courseModel.find({
                $or: [
                    { creatorId: { $exists: false } },
                    { creatorId: null }
                ]
            });

            if (coursesWithoutCreator.length > 0) {
                // Update these courses to have this admin as creator
                await courseModel.updateMany(
                    {
                        $or: [
                            { creatorId: { $exists: false } },
                            { creatorId: null }
                        ]
                    },
                    { creatorId: admin._id }
                );

                // Re-fetch the courses
                courses = await courseModel.find({ creatorId: admin._id });
            }
        }

        // Return all courses for this admin
        return res.json({
            msg: courses.length > 0 ? `${courses.length} courses found for admin` : "no courses available for this admin",
            courses: courses || [],
            adminInfo: {
                id: admin._id,
                email: admin.email,
                username: admin.username
            }
        });
    } catch (error) {
        console.error("Error fetching admin courses:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            "msg": "internal server error while fetching courses",
            "error": error.message
        });
    }
})

//delete any course create by admin
adminRoute.delete("/course/:courseId", adminAuth, async (req, res) => {
    try {
        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({ msg: "Course ID is required" });
        }

        const admin = await adminModel.findOne({email:req.email});
        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        const course = await courseModel.findOneAndDelete({
            _id: courseId,
            creatorId: admin._id
        });

        if (!course) {
            return res.status(404).json({ msg: "Course not found or you are not authorized to delete this course" });
        }

        res.json({ msg: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        return res.status(500).json({ msg: "Internal server error while deleting course" });
    }
})


adminRoute.put("/course/:courseId", adminAuth, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { title, description, price, image } = req.body;

        if (!title || !description || !price || !image) {
            return res.status(400).json({
                "msg": "all fields are required"
            });
        }

        // Validate price is a number
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                "msg": "price must be a valid positive number"
            });
        }

        const admin = await adminModel.findOne({email:req.email});
        if (!admin) {
            return res.status(404).json({
                "msg": "admin not found"
            });
        }

        const course = await courseModel.findOneAndUpdate(
            { _id: courseId, creatorId: admin._id },
            { title: title.trim(), description: description.trim(), price: parseFloat(price), image: image.trim() },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ msg: "Course not found or you are not authorized to update this course" });
        }

        res.json({
            msg: "Course updated successfully",
            course: course
        });
    } catch (error) {
        console.error("Error updating course:", error);
        return res.status(500).json({ msg: "Internal server error while updating course" });
    }
});

adminRoute.get("/list/:courseId", adminAuth, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                "msg": "course ID is required"
            });
        }

        const admin = await adminModel.findOne({email:req.email});
        if (!admin) {
            return res.status(404).json({
                "msg": "admin not found"
            });
        }

        // Check if course exists and belongs to this admin
        const course = await courseModel.findOne({_id: courseId, creatorId: admin._id});
        if (!course) {
            return res.status(404).json({
                "msg": "course not found or you are not authorized to view this course"
            });
        }

        const users = await userModel.find({ "purchasedCourses.courseId": courseId });

        res.json({
            msg: users.length > 0 ? "users who purchased the course" : "no users have purchased this course",
            users: users || []
        });
    } catch (error) {
        console.error("Error fetching course users:", error);
        return res.status(500).json({
            "msg": "internal server error while fetching course users"
        });
    }
})


module.exports = {
    adminRoute : adminRoute
}
