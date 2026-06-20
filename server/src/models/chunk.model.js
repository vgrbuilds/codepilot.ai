import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema(
{
    repositoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Repository",
        required:true
    },

    filePath:{
        type:String,
        required:true
    },

    language:{
        type:String
    },

    content:{
        type:String,
        required:true
    },

    embedding:{
        type:[Number],
        required:true
    },

    metadata:{
        type:Object,
        default:{}
    }

},
{
    timestamps:true
});


export default mongoose.model(
    "Chunk",
    ChunkSchema
);