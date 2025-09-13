import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurentUser } from "@/lib/actions/auth.action";

interface RouteParams {
  params: {
    id: string;
  };
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });
  7
  // 🔥 PROPER CHECK - Same logic as in InterviewCard
  const hasMeaningfulFeedback = feedback &&
    feedback.totalScore !== null &&
    feedback.totalScore !== undefined &&
    typeof feedback.totalScore === 'number';

  // Handle no feedback - UPDATED CONDITION
  if (!hasMeaningfulFeedback) {
    return (
      <section className="section-feedback">
        <h1>No Feedback Available</h1>
        <p>This interview has not been evaluated yet.</p>
        <Button>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore ?? "N/A"}
              </span>
              {feedback?.totalScore && "/100"}
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment || "No assessment available yet."}</p>

      {/* Rest of your component stays the same... */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback?.categoryScores && typeof feedback.categoryScores === 'object' ? (
          Object.entries(feedback.categoryScores).map(([categoryName, score], index) => (
            <div key={index}>
              <p className="font-bold">
                {index + 1}. {categoryName} ({score as number}/100)
              </p>
              {/* Note: Your current structure doesn't have comments per category in the DB */}
            </div>
          ))
        ) : (
          <p>No category scores available</p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul className="list-disc list-inside space-y-1">
          {feedback?.strengths && Array.isArray(feedback.strengths) && feedback.strengths.length > 0 ? (
            feedback.strengths.map((strength: string, index: number) => (
              <li key={index} className="ml-4">{strength}</li>
            ))
          ) : (
            <li>No strengths available</li>
          )}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul className="list-disc list-inside space-y-1">
          {feedback?.areasForImprovement && Array.isArray(feedback.areasForImprovement) && feedback.areasForImprovement.length > 0 ? (
            feedback.areasForImprovement.map((area: string, index: number) => (
              <li key={index} className="ml-4">{area}</li>
            ))
          ) : (
            <li>No areas for improvement available</li>
          )}
        </ul>
      </div>

      <div className="buttons flex gap-4 mt-6">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;