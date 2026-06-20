import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema(
{
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },

    role:{
        type:String,
        enum:[
            "user",
            "assistant"
        ],
        required:true
    },

    content:{
        type:String,
        required:true
    },

    sources:[
        {
            filePath:String,
            chunkId:String
        }
    ]

},
{
    timestamps:true
});


export default mongoose.model(
    "Message",
    messageSchema
);