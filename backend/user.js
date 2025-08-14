const { Router } = require('express');
const jwt = require("jsonwebtoken")
const { userModel } = require("./db/user");
const { courseModel } = require("./db/courses");
const { userAuth } = require("./auth/userAuth");

const userRouter = Router();


userRouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.json({
            "msg": "all fields are required"
        })
    }
    const token = jwt.sign({ username, email }, process.env.JWT_SECRET_USER, { expiresIn: '24h' });
    const user = new userModel({
        username: username,
        email: email,
        password: password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        purchasedCourses: []
    });
    await user.save();
    return res.json({
        "msg": "user registered successfully",
        "details": user
    });

})

userRouter.post("/login", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                "msg": "all fields are required"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({
            $and: [
                { email: email },
                { username: username },
                { password: password }
            ]
        });

        if (!user) {
            return res.status(401).json({
                "msg": "invalid credentials"
            });
        }

        const token = jwt.sign({ username, email }, process.env.JWT_SECRET_USER, { expiresIn: '24h' });
        return res.json({
            "msg": "user login successfully",
            "token": token
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            "msg": "internal server error"
        });
    }
})
userRouter.get("/courses", userAuth, async (req, res) => {
    const courses = await courseModel.find();
    console.log(courses)
    if (!courses) {
        return res.json({
            "msg": "no courses available"
        });
    }
    res.json({
        msg: "all courses available for user",
        courses: courses
    })
})

userRouter.get("/course/:id", userAuth, async (req, res) => {
    const courseId = req.params.id;
    if (!courseId) {
        return res.json({
            "msg": "course ID is required"
        });
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
        return res.json({
            "msg": "course not found"
        });
    }
    return res.json({
        "msg": "searched course",
        "course": course
    });
});


userRouter.post("/purchase/:id", userAuth, async (req, res) => {
    const courseId = req.params.id;
    if (!courseId) {
        return res.json({
            "msg": "course ID is required"
        });
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
        return res.json({
            "msg": "course not found"
        });
    }
    const user = await userModel.findOne(
        { email: req.email }
    );

    // Check if user already owns this course
    const alreadyPurchased = user.purchasedCourses.some(element => element.courseId.toString() === courseId);
    if (alreadyPurchased) {
        return res.json({
            msg: "You cannot buy the same course twice. You already own this course."
        });
    }

    const userupdate = await userModel.findOneAndUpdate(
        { email: req.email },
        { $push: { purchasedCourses: { courseId: course._id } } },
        { new: true }
    );
    
    return res.json({
        "msg": "course purchased successfully",
        "purchasedCourse": course
    });
}
);

userRouter.get("/purchasedCourses", userAuth, async (req, res) => {
    const user = await userModel.findOne({ email: req.email })
    if (!user) {
        return res.json({
            "msg": "user not found"
        });
    }
    if (user.purchasedCourses.length === 0) {
        return res.json({
            "msg": "no purchased courses found",
            "purchasedCourses": []
        });
    }
    let purchased = []
    async function purchases(element) {
        try {
            let userpurchased = await courseModel.findOne(element.courseId);
            if (userpurchased) {
                purchased.push(userpurchased);
            } else {
                console.log(`Course with ID ${element.courseId} not found`);
            }
        } catch (error) {
            console.error(`Error fetching course ${element.courseId}:`, error);
        }
    }

    for (let i = 0; i < user.purchasedCourses.length; i++) {
        await purchases(user.purchasedCourses[i]);
    }
    
    return res.json({
        "msg": "purchased courses found",
        "purchasedCourses": purchased
    });
});

userRouter.delete("/purchasedCourse/:id", userAuth, async (req, res) => {
    const courseId = req.params.id;
    if (!courseId) {
        return res.json({
            "msg": "course ID is required"
        });
    }
   
    const updatedUser = await userModel.findOneAndUpdate( {
        email: req.email
    }, {
        $pull: { purchasedCourses: { courseId: courseId } }
    }, {
        new: true
    }); 
    if (!updatedUser) {
        return res.json({
            "msg": "course not found in purchased courses"
        });
    }
    return res.json({
        "msg": "course removed from purchased courses successfully",
        "updatedUser": updatedUser
    }); 
})




module.exports = {
    userRouter: userRouter
}
