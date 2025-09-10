'use server'

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";


export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}
export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db
        .collection('interviews')
        .doc(id)
        .get();

    return interview.data() as Interview | null;
}
export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
  ): Promise<Feedback | null> {
    const { interviewId, userId } = params;
  
    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();
  
    if (querySnapshot.empty) return null;
  
    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  }

// Add this function in your general.action.ts file
async function createFallbackFeedback(interviewId: string, userId: string, reason: string) {
    console.log("🔄 Creating fallback feedback due to:", reason);
    
    try {
        const fallbackFeedback = await db.collection('feedback').add({
            interviewId,
            userId,
            totalScore: 75,
            categoryScores: {
                "Communication Skills": 75,
                "Technical Knowledge": 75,
                "Problem Solving": 75,
                "Cultural Fit": 75,
                "Confidence and Clarity": 75
            },
            strengths: ["Participated in the interview", "Showed engagement"],
            areasForImprovement: ["More detailed responses recommended", "Practice technical explanations"],
            finalAssessment: `Interview completed. AI analysis unavailable due to: ${reason}`,
            createdAt: new Date().toISOString(),
            generatedBy: 'fallback',
            errorReason: reason
        });

        console.log("✅ Fallback feedback created:", fallbackFeedback.id);
        
        return {
            success: true,
            feedbackId: fallbackFeedback.id
        };
    } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        return { 
            success: false, 
            error: (fallbackError as Error).message 
        };
    }
}


export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;

    console.log("=== FEEDBACK GENERATION START ===");
    console.log("Received transcript:", transcript);

    try {
        if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
            console.log("❌ No transcript data available");
            return await createFallbackFeedback(interviewId, userId, "No transcript available");
        }

        // Map VAPI roles to readable format
        const formattedTranscript = transcript
            .map((message: { role: string; content: string }) => {
                let displayRole = '';
                switch (message.role) {
                    case 'assistant':
                        displayRole = 'Interviewer';
                        break;
                    case 'user':
                        displayRole = 'Candidate';
                        break;
                    case 'system':
                        displayRole = 'System';
                        break;
                    default:
                        displayRole = message.role;
                }
                return `${displayRole}: ${message.content}\n`;
            })
            .join('');

        console.log("Formatted transcript preview:", formattedTranscript.substring(0, 500));

        if (formattedTranscript.trim().length < 50) {
            console.log("❌ Insufficient transcript content");
            return await createFallbackFeedback(interviewId, userId, "Insufficient content");
        }

        console.log("🤖 Starting AI generation with new schema...");

        const { object } = await generateObject({
            model: google("gemini-2.0-flash-001"),
            schema: feedbackSchema,
            prompt: `Analyze this technical interview transcript and provide detailed feedback:

${formattedTranscript}

Provide scores from 0-100 for each category and specific, actionable feedback.`,
        });

        console.log("✅ AI generation successful!");

        // Transform the flat response back to the expected structure
        const feedbackData = {
            interviewId,
            userId,
            totalScore: object.totalScore,
            categoryScores: {
                "Communication Skills": object.communicationSkills,
                "Technical Knowledge": object.technicalKnowledge,
                "Problem Solving": object.problemSolving,
                "Cultural Fit": object.culturalFit,
                "Confidence and Clarity": object.confidenceAndClarity
            },
            strengths: [object.strength1, object.strength2, object.strength3].filter(Boolean),
            areasForImprovement: [object.improvement1, object.improvement2, object.improvement3].filter(Boolean),
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString(),
            generatedBy: 'ai'
        };

        const feedback = await db.collection('feedback').add(feedbackData);
        console.log("✅ Feedback saved successfully:", feedback.id);

        return {
            success: true,
            feedbackId: feedback.id
        };

    } catch (error) {
        console.error('❌ Error in createFeedback:', error);
        return await createFallbackFeedback(interviewId, userId, (error as Error).message);
    }
}