import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Courses from '@/components/landing/Courses';
import ApplicationForm from '@/components/landing/ApplicationForm';

export const metadata = {
  title: 'CodeSchool | Онлайн-школа программирования',
  description: 'Обучение программированию для детей и подростков.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Courses />
      <ApplicationForm />
    </>
  );
}


