import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const JoinUs = () => {
  const router = useRouter();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("android")) {
      // Redirect to Google Play Store
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.byearly.earlyapp&pcampaignid=web_share";
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      // Redirect to Apple App Store
      window.location.href = "https://apps.apple.com/cl/app/early/id6504718223";
    } else {
      // Redirect to Web
      router.push("https://byearly.com/");
    }
  }, [router]);

  return <div>Redirecting...</div>;
};

export default JoinUs;
