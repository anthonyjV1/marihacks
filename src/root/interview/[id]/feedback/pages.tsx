import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { 
  getFeedbackByInterviewId, 
  getInterviewById,
  getCurrentUser
} from '@/lib/api';

interface RouteParams {
  id: string;
}

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface FeedbackData {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  userId: string;
  role: string;
  // Add other interview properties as needed
}

const Feedback = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const interviewData = await getInterviewById(id!);
        if (!interviewData) {
          navigate('/');
          return;
        }
        setInterview(interviewData);

        const feedbackData = await getFeedbackByInterviewId({
          interviewId: id!,
          userId: currentUser?.id ?? ''
        });
        setFeedback(feedbackData);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!interview || !feedback) {
    return null; // or redirect handled by useEffect
  }

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview -{' '}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <img src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{' '}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <img src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format('MMM D, YYYY h:mm A')
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {feedback?.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button 
          className="btn-secondary flex-1"
          onClick={() => navigate('/')}
        >
          <p className="text-sm font-semibold text-primary-200 text-center">
            Back to dashboard
          </p>
        </Button>

        <Button 
          className="btn-primary flex-1"
          onClick={() => navigate(`/interview/${id}`)}
        >
          <p className="text-sm font-semibold text-black text-center">
            Retake Interview
          </p>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;