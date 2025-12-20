import mongoose, { Schema, Document } from "mongoose";
import { FigmaDesignDocument } from "../types/figma-design.types";

export interface IFigmaDesign extends Document, Omit<FigmaDesignDocument, "_id"> { }

const FigmaDesignSchema = new Schema<IFigmaDesign>(
    {
        designId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        designData: {
            type: Schema.Types.Mixed,
            required: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        activeRole: {
            type: String,
            required: true,
            enum: ["cto", "CTO"], // Only CTO can create designs
        },
    },
    {
        timestamps: true,
        collection: "figmadesigns",
    }
);

// TTL index: auto-delete designs after 30 days
FigmaDesignSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Ensure indexes are created
FigmaDesignSchema.index({ designId: 1 });
FigmaDesignSchema.index({ userId: 1 });

const FigmaDesign =
    (mongoose.models.FigmaDesign as mongoose.Model<IFigmaDesign>) ||
    mongoose.model<IFigmaDesign>("FigmaDesign", FigmaDesignSchema);

export default FigmaDesign;
