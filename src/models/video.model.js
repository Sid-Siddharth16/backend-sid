
import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type: String, //cloudinary url
        required : true
    },
    thumbanail : {
        type: String, //cloudinary url
        required : true
    },
    title : {
        type: String,
        required : true,
        trim: true,
        
    },
    description : {
        type: String,
        required : true,
        trim: true,
        
    },
    duration : {
        type: Number, // cloudnary duration in seconds
        required : true,
    },
    views : {
        type: Number,
        default : 0
    },
    isPublished : {
        type: Boolean,
        default : true
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    likes: {
        type: Number,
        default: 0
    }

}, {timestamps: true});

// add pagination plugin to video schema
videoSchema.plugin(mongooseAggregatePaginate); 
export const Video = mongoose.model("Video", videoSchema);