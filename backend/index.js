const express = require("express")
const mongoose = require("mongoose")
const Todo = require("./models/todo")
const cors = require("cors")


mongoose.connect("mongodb://localhost/todo", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("mongodb successful connected");
}).catch((err) => {
    console.log("Error connecting to mongodb");
})

const app = express()
app.use(cors())
const port = process.env.PORT || 3500;

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get("/todo", async (req, res) => {
    try {
        const todo = await Todo.find()
        let orderedTodos = [];
        let unorderedTodos = [];

        for (let i = 0; i < todo.length; i++) {
            if (todo[i].order !== undefined) {
                orderedTodos.push(todo[i]);
            } else {
                unorderedTodos.push(todo[i]);
            }
        }

        orderedTodos.sort((a, b) => a.order - b.order);
        
        let allTodo = [...unorderedTodos, ...orderedTodos]
        res.json( allTodo )
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching todos.');
    }
})

app.post("/todo", async (req, res) => {
    try{
        const todo = req.body.todo 

        if(!todo || todo.trim() === ""){
            return res.json({
                status: false,
                message: "Input field is required"
            })
        }

        await Todo.create({
            todo: todo
        })

        let savedTodo = await Todo.find()
        
        res.status(200).json({
            status: true,
            message: "todo successfull added",
            data: savedTodo
        })
    
    }catch(err){
        res.status(500).json({message: "request not process"})
        console.log(err);
    }
})

app.delete("/todo/:id", async(req, res) => {
    try {
        const {id} = req.params
        const data = await Todo.findByIdAndDelete(id.toString())

        if(!data){
            return res.json({
                status: false,
                message: "Todo item not found"
            })
        }

        let todo = await Todo.find()

        res.status(200).json({
            status: true,
            message: "Todo has been deleted",
            data: todo
        })

    } catch (error) {
        console.error("internal server error", error);
        res.status(500).json({message: "internal server error"})        
    }
})

app.delete("/complete/todo", async (req, res) => {
    try {

        let completedTodos = await Todo.deleteMany({ isCompleted: true });

        if (completedTodos.deletedCount === 0) {
            return res.json({
                status: false,
                message: "No completed todos to delete"
            });
        }

        let savedTodo = await Todo.find()

        res.json({
            status: true,
            message: 'Completed todos deleted successfully',
            data: savedTodo
        });
        
    } catch (error) {
        console.error("Internal server error");
        res.status(500).json({message: "Internal server error" })
    }
})

app.put("/todo/:id", async (req, res) => {
    try {
        let { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: false,
                message: 'Invalid ID format'
            });
        }

        const todo = await Todo.findById(id)

        if(!todo){
            return res.json({
                status: false,
                message: 'Todo item not found'
            })
        }

        let data = todo.isCompleted = !todo.isCompleted

        await todo.save();

        let savedTodo = await Todo.find()
        
        res.json({
            status: true,
            message: 'Todo item updated successfully',
            data: savedTodo
        });

    } catch (error) {
        console.error("internal server error");
        res.status(500).json({message: "Internal server error"})
    }
})

app.post("/rearrange-todos", async (req, res) => {
    try {

        const {newOrder} = req.body

        await Promise.all(
            newOrder.map((item, index) =>
                Todo.findByIdAndUpdate(item._id, { order: index })
            )
        );

        res.status(200).send("Items rearranged successfully")
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.listen(port , () => {
    console.log(`server is listening on port ${port}`);
})