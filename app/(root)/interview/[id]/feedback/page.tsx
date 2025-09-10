import { getCurentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.action';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async({params}: RouteParams) => {
  const {id} = await params;
  const user = await getCurentUser();
  const interview = await getInterviewById(id);
  if(!interview) redirect('/')

  const feedback = await getFeedbackByInterviewId({
    interviewId:id,
    userId: user?.id!,

  });
  console.log(feedback)
  return (
    <section className='section-feedback'>
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview-{" "}
          <span className="capitalize">{interview.role}</span>Interview
        </h1>
      </div>
      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt={'star'}/>
            <p>
              Overall Impression:{" "}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default page