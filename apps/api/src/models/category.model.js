
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minLength: 2,
        maxLength: 50
    },
    description: {
        type: String,
        trim: true,
        default: '',
        maxLength: 500
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
}, {
    timestamps: true
})

const Category = mongoose.model("Category", categorySchema)

export default Category