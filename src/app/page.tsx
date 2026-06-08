"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeNavbar from "@/components/home/navbar";
import HomeHero from "@/components/home/hero";
import AssessmentForm from "@/components/home/assessment-form";
import Facilities from "@/components/home/facilities";
import GymGallery from "@/components/home/gym-gallery";
import Locations from "@/components/home/locations";
import FitnessJourney from "@/components/home/fitness-journey";
import AppPreview from "@/components/home/app-preview";
import Nutrition from "@/components/home/nutrition";
import WorkoutCategories from "@/components/home/workout-categories";
import WhyChoose from "@/components/home/why-choose";
import HowItWorks from "@/components/home/how-it-works";
import Transformations from "@/components/home/transformations";
import TrainerTeam from "@/components/home/trainer-team";
import DownloadApp from "@/components/home/download-app";
import HomeFaq from "@/components/home/faq";
import SeoSection from "@/components/home/seo-section";
import GymFooter from "@/components/home/gym-footer";
import SiteFooter from "@/components/site-footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const storedRole = window.localStorage.getItem("authRole");
    const hasAdmin = window.localStorage.getItem("adminAuthed") === "true";
    const trainerCodeValue = window.localStorage.getItem("trainerCode");
    const memberId = window.localStorage.getItem("memberId");

    if (storedRole === "admin" && hasAdmin) {
      router.replace("/admin");
      return;
    }

    if (storedRole === "trainer" && trainerCodeValue) {
      router.replace("/trainer");
      return;
    }

    if (storedRole === "member" && memberId) {
      router.replace("/member");
    }
  }, [router]);

  return (
    <div className="sg-premium min-h-screen text-white">
      <HomeNavbar />
      <HomeHero />
      <AssessmentForm />
      <Facilities />
      <GymGallery />
      <Locations />
      <FitnessJourney />
      <AppPreview />
      <Nutrition />
      <WorkoutCategories />
      <WhyChoose />
      <HowItWorks />
      <Transformations />
      <TrainerTeam />
      <DownloadApp />
      <HomeFaq />
      <SeoSection />
      <GymFooter />
      <div className="px-4 py-6 sm:px-6">
        <SiteFooter />
      </div>
    </div>
  );
}
