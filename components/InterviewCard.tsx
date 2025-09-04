import { getRandomInterviewCover } from '@/lib/utils';
import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './displayTechIcons';

// userId is not here imported yet
const InterviewCard = ({ interviewId, role, type, techstack, createdAt }: InterviewCardProps) => {
  const feedback = null as Feedback | null;
  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  const formattedData = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY')

  return(
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
      <div className="card-interview relative p-4"> {/* Add relative and padding */}
        {/* Badge */}
        <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
          <p className="badge-text">{normalizedType}</p>
        </div>

        {/* Profile Image */}
        <Image 
          src={getRandomInterviewCover()} 
          alt="cover-image" 
          width={90} 
          height={90} 
          className='rounded-full object-cover size-[90px]' 
        />

        {/* Title */}
        <h3 className="mt-5 capitalize"> {/* Fixed: capitalize instead of capitalized */}
          {role} Interview
        </h3>

        {/* Date and Score Row */}
        <div className="flex flex-row items-center gap-4 mt-3">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
            <p>{formattedData}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" alt="star" width={22} height={22} />
            <p>{feedback?.totalScore || '---'}/100</p>
          </div>
        </div>

        {/* Assessment Text */}
        <p className="line-clamp-2 mt-4 text-sm text-gray-600">
          {feedback?.finalAssessment || "You haven't taken the interview yet. Take it now!"}
        </p>

        {/* Bottom Row: Tech Icons and Button */}
        <div className="flex flex-row justify-between items-center mt-4">
          <DisplayTechIcons techStack={techstack} />
          
          <Button className='btn-primary'>
            <Link href={feedback
              ? `/interview/${interviewId}/feedback`
              : `/interview/${interviewId}`
            }>
              {feedback ? 'Check Feedback' : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard