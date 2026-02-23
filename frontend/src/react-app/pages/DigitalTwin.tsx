import { useState } from "react";
import { motion } from "framer-motion";
import {  
  Box,
  //X,
  Thermometer,
  Gauge,
  Zap, } from "lucide-react";
//import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import Navbar from "@/react-app/components/Navbar";
import PageTransition from "@/react-app/components/PageTransition";
import ScrollReveal from "@/react-app/components/ScrollReveal";
import { cn } from "@/react-app/lib/utils";

import { io } from "socket.io-client";
import { useEffect } from "react";

//mqtt code (IMP)
export default function DigitalTwinPage() {
  //const [isPanelOpen, setIsPanelOpen] = useState(false);

  const THRESHOLDS = {
    temperature: 80,
    vibration: 6,
    speed: 5000,
  };
    const [temperature, setTemperature] = useState(0);
    const [vibration, setVibration] = useState(0);
    const [speed, setSpeed] = useState(0);

    useEffect(() => {
    const socket = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("mqttData", (data: any) => {
      setTemperature(Number(data.temperature));
      setVibration(Number(data.vibration));
      setSpeed(Number(data.spindleSpeed));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

    /* ---------- HEALTH SCORE CALCULATION ---------- */

    const calculateHealthScore = () => {
      let score = 100;

      if (temperature > THRESHOLDS.temperature)
        score -= ((temperature - THRESHOLDS.temperature) / THRESHOLDS.temperature) * 40;

      if (vibration > THRESHOLDS.vibration)
        score -= ((vibration - THRESHOLDS.vibration) / THRESHOLDS.vibration) * 35;

      if (speed > THRESHOLDS.speed)
        score -= ((speed - THRESHOLDS.speed) / THRESHOLDS.speed) * 25;

      return Math.max(Math.round(score), 0);
    };

    const healthScore = calculateHealthScore();

    /* ---------- MULTIPLE DIAGNOSIS ---------- */

    const diagnoses: string[] = [];

    if (temperature > THRESHOLDS.temperature) {
      diagnoses.push("High Temperature detected – Check spindle cooling system.");
    }

    if (vibration > THRESHOLDS.vibration) {
      diagnoses.push("Excessive Vibration – Possible bearing wear.");
    }

    if (speed > THRESHOLDS.speed) {
      diagnoses.push("Overspeed Condition – Motor under stress.");
    }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        
        {/* Header */}
        <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Digital Twin Workspace</h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-gray-600 text-lg ml-13"
            >
              Real-time 3D visualization of your CNC machine with AI-powered health insights
            </motion.p>
          </div>
        </section>
            
        {/* Main Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
          
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-[600px] lg:h-[700px] overflow-hidden mb-6">
                <iframe
                  src="/digital-twin/index.html"
                  className="w-full h-full"
                  style={{ border: "none" }}
                  title="3D Digital Twin"
                />
              </Card>
            </motion.div>


            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[
                /*{
                  icon: Activity,
                  label: "Health Score",
                  value: `${healthScore}%`,
                  critical: healthScore < 70,
                },*/
                {
                  icon: Thermometer,
                  label: "Temperature",
                  value: `${temperature}°C`,
                  critical: temperature > THRESHOLDS.temperature,
                },
                {
                  icon: Gauge,
                  label: "Vibration",
                  value: `${vibration} mm/s`,
                  critical: vibration > THRESHOLDS.vibration,
                },
                {
                  icon: Zap,
                  label: "Spindle Speed",
                  value: `${speed} rpm`,
                  critical: speed > THRESHOLDS.speed,
                },
              ].map((stat, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <motion.div
                    animate={
                      stat.critical
                        ? { opacity: [1, 0.4, 1] }
                        : { opacity: 1 }
                    }
                    transition={
                      stat.critical
                        ? { repeat: Infinity, duration: 1 }
                        : {}
                    }
                  >
                    <Card
                      className={cn(
                        "p-4 transition-all duration-300",
                        stat.critical
                          ? "bg-red-100 border border-red-400"
                          : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <stat.icon
                          className={cn(
                            "w-6 h-6",
                            stat.critical
                              ? "text-red-600"
                              : "text-gray-700"
                          )}
                        />
                        <div>
                          <p className="text-xs text-gray-500">
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold">
                            {stat.value}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Threshold:{" "}
                            {stat.label === "Temperature" && `${THRESHOLDS.temperature}°C`}
                            {stat.label === "Vibration" && `${THRESHOLDS.vibration} mm/s`}
                            {stat.label === "Spindle Speed" && `${THRESHOLDS.speed} rpm`}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            {/* MULTIPLE DIAGNOSIS PANEL */}
            {diagnoses.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6"
              >
                <Card className="p-5 bg-red-50 border border-red-300">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">
                    Active Diagnoses
                  </h3>

                  <ul className="space-y-1 text-sm text-red-700">
                    {diagnoses.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}
          </div>
          </section>
     </div>
    </PageTransition>
  );
}

