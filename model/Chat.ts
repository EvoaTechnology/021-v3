import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChat extends Document {
  content: string;
  role: "user" | "ai";
  sessionId: string; // Changed from mongoose.Types.ObjectId to string
  activeRole?: string; // Advisor role: "idea-validator", "ceo", "cto", "cfo", "cmo"
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    content: { type: String, required: true },
    role: { type: String, enum: ["user", "ai"], required: true },
    sessionId: { type: String, ref: "ChatSession", required: true }, // Changed from ObjectId to String
    activeRole: { type: String, required: false }, // Optional: advisor context
  },
  { timestamps: true }
);

// Index for fast retrieval of messages within a session
chatSchema.index({ sessionId: 1, createdAt: 1 });
// Index for filtering messages by advisor role
chatSchema.index({ sessionId: 1, activeRole: 1, createdAt: 1 });

const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
