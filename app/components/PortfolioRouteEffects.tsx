"use client";

import SplashScreen from "./SplashScreen";
import CustomCursorLoader from "./CustomCursorLoader";
import ConstructionLoader from "./construction/ConstructionLoader";

export default function PortfolioRouteEffects() {
  return (
    <>
      <SplashScreen />
      <CustomCursorLoader />
      <ConstructionLoader />
    </>
  );
}
