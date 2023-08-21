const express=require("express")
const {connection} = require("./db")
const { userRouter } = require("./routes/user.Route")
const { postRouter } = require("./routes/post.Route")
const cors=require("cors")
// const { auth } = require("./middlewares/auth.middleware")
require("dotenv").config();

const app = express();
app.use(cors())
app.use(express.json())


app.use("/posts",postRouter )
app.use("/users",userRouter)

app.listen(process.env.port, async () => {
    try {
      await connection
      console.log(`server is running on port ${process.env.port}`);
      console.log("connected to DB");
    } catch (err) {
      console.log(err);
    }
  });