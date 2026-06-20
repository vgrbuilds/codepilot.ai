import mongoose from 'mongoose';


const repositorySchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    githubId:{
        type:String,
        required:true,
        unique:true
    },

    name:{
        type:String,
        required:true
    },

    fullName:{
        type:String,
        required:true
    },

    url:{
        type:String,
        required:true
    },

    branch:{
        type:String,
        default:"main"
    },

    status:{
        type:String,
        enum:[
            "pending",
            "processing",
            "completed",
            "failed"
        ],
        default:"pending"
    }

},
{
    timestamps:true
});


export default mongoose.model(
    "Repository",
    repositorySchema
);