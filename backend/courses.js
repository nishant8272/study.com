const { Router } = require("express");
const { adminAuth } = require("./auth/adminAuth");
const { courseModel } = require("./db/courses");
const {adminModel} = require("./db/admin");

const coursesRoute = Router();
//get all courses available on website 
coursesRoute.get("/preview",async (req, res) => {
    const courses = await courseModel.find();
   
    if (!courses) { 
        return res.json({
            "msg": "no courses available"
        });
    }
    res.json({
        msg: "all courses available for user",
        courses: courses
    });
})

//post course on server only  by admin 

coursesRoute.post("/course",adminAuth,async(req,res)=>{
    try {
        const {title, description, price, image } = req.body;
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

        // Validate image URL
        if (!image.startsWith('http')) {
            return res.status(400).json({
                "msg": "image must be a valid URL"
            });
        }

        const admin = await adminModel.findOne({email:req.email});
        if (!admin) {
            return res.status(404).json({
                "msg": "admin not found"
            });
        }

        const course = new courseModel({
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            image: image.trim(),
            creatorId: admin._id
        });

        await course.save();
        return res.status(201).json({
            "msg": "course created successfully",
            "course": course
        });
    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            "msg": "internal server error while creating course"
        });
    }
})

module.exports = {
    coursesRoute : coursesRoute
}
