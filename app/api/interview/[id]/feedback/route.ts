import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: {
        id: string; // This is the interviewId from the URL
    };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: interviewId } = params;
        const { userId, answers, questions } = await req.json();

        console.log(`Generating feedback for interview: ${interviewId}`);

        // Generate feedback - answers is now array of strings
        const { text: feedbackText } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `
            Analyze this interview performance and provide detailed feedback:
            
            Questions and Answers:
            ${questions.map((q: string, i: number) => `
            Q${i + 1}: ${q}
            A${i + 1}: ${answers[i] || 'No answer provided'}
            `).join('\n')}
            
            Please provide feedback in this exact JSON format (no additional text):
            {
              "finalAssessment": "Overall detailed feedback paragraph with specific strengths and areas for improvement",
              "categoryScores": {
                "Communication Skills": 75,
                "Technical Knowledge": 80,
                "Problem Solving": 70,
                "Cultural Fit": 65,
                "Confidence and Clarity": 72
              }
            }
          `
        });

        // Rest of your code stays the same...
        const feedback = JSON.parse(feedbackText);

        const feedbackDoc = await db.collection('feedback').add({
            userId,
            interviewId,
            finalAssessment: feedback.finalAssessment,
            categoryScores: feedback.categoryScores,
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            feedbackId: feedbackDoc.id,
            interviewId,
            feedback,
            message: `Feedback generated successfully`
        });

    } catch (error) {
        console.error('Error generating feedback:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate feedback',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Optional: Add GET method to retrieve existing feedback
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: interviewId } = params;

        const feedbackSnapshot = await db
            .collection('feedback')
            .where('interviewId', '==', interviewId)
            .limit(1)
            .get();

        if (feedbackSnapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Feedback not found' },
                { status: 404 }
            );
        }

        const feedbackDoc = feedbackSnapshot.docs[0];
        const feedback = {
            id: feedbackDoc.id,
            ...feedbackDoc.data(),
        };

        return NextResponse.json({
            success: true,
            feedback
        });

    } catch (error) {
        console.error('Error retrieving feedback:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve feedback' },
            { status: 500 }
        );
    }
}