import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { cn } from "@/react-app/lib/utils";
import {
  Activity,
  Thermometer,
  Gauge,
  BarChart3,
  Brain
} from "lucide-react";
import { Card } from "@/react-app/components/ui/card";
import { Progress } from "@/react-app/components/ui/progress";
import Navbar from "@/react-app/components/Navbar";
import PageTransition from "@/react-app/components/PageTransition";

type Alert = {
  message: string;
  level: "warning" | "critical";
};

interface MachineData {
  machineId: string;
  temperature: string;
  vibration: string;
  spindleSpeed: number;
  timestamp: string;
}

interface Task {
  task: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  progress: number;
}

interface Prediction {
  name: string;
  days: string;
  condition: string;
  color: string;
}

export default function AnalyticsPage() {
  const [liveData, setLiveData] = useState<MachineData | null>(null);
  const [healthScore, setHealthScore] = useState(100);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [preventiveTasks, setPreventiveTasks] = useState<Task[]>([]);
  const [futurePredictions, setFuturePredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Compute health color based on current health score
  const healthColor =
    healthScore > 85
      ? "text-green-600"
      : healthScore > 65
      ? "text-amber-600"
      : "text-red-600";

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("mqttData", (data: MachineData) => {
      setLiveData(data);
      runAI(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function runAI(data: MachineData) {
    const temp = Number(data.temperature || 0);
    const vib = Number(data.vibration || 0);
    const speed = Number(data.spindleSpeed || 0);

    // --- Alerts ---
    const newAlerts: Alert[] = [];
    if (temp > 80)
      newAlerts.push({
        message: "Critical: Overheating detected in spindle system",
        level: "critical",
      });
    else if (temp > 75)
      newAlerts.push({
        message: "Warning: Temperature approaching unsafe limit",
        level: "warning",
      });

    if (vib > 7)
      newAlerts.push({
        message: "Critical: Excessive vibration – bearing damage possible",
        level: "critical",
      });
    else if (vib > 5)
      newAlerts.push({
        message: "Warning: Vibration above normal range",
        level: "warning",
      });

    if (speed > 5000)
      newAlerts.push({
        message: "Critical: Spindle overspeed risk",
        level: "critical",
      });
    else if (speed > 4800)
      newAlerts.push({
        message: "Warning: Spindle nearing maximum rated speed",
        level: "warning",
      });

    setAlerts(newAlerts);

    // --- Health Score ---
    let score = 100;
    if (temp > 80) score -= 20;
    if (vib > 6) score -= 20;
    if (speed > 4800) score -= 15;
    setHealthScore(score);

    // --- Diagnosis ---
    const issues: string[] = [];
    if (temp > 80) issues.push("Overheating Risk Detected");
    if (vib > 6) issues.push("Vibration Anomaly – Possible Bearing Wear");
    if (speed > 4800) issues.push("Overspeed Warning – Load Imbalance Risk");
    if (issues.length === 0) issues.push("Machine Operating Normally");
    setDiagnoses(issues);

    // --- Preventive Maintenance ---
    const tasks: Task[] = [];
    if (vib > 6)
      tasks.push({
        task: "Inspect spindle bearings for wear and lubrication",
        priority: "High",
        due: "Within 24 hours",
        progress: 0,
      });
    if (temp > 80)
      tasks.push({
        task: "Check and optimize coolant flow; inspect thermal sensors",
        priority: "Medium",
        due: "Within 48 hours",
        progress: 20,
      });
    if (speed > 4800)
      tasks.push({
        task: "Perform spindle load balancing and torque verification",
        priority: "Medium",
        due: "Within 3 days",
        progress: 10,
      });
    if (tasks.length === 0)
      tasks.push({
        task: "Routine system monitoring and lubrication check",
        priority: "Low",
        due: "Next scheduled maintenance",
        progress: 80,
      });
    setPreventiveTasks(tasks);

    // --- Future Predictions ---
    const predictions: Prediction[] = [];
    if (vib > 7)
      predictions.push({
        name: "Spindle Bearing",
        days: "Approx. 30 days",
        condition: "High vibration detected; potential bearing fatigue",
        color: "text-red-600",
      });
    if (temp > 90)
      predictions.push({
        name: "Drive Motor & Thermal Sensors",
        days: "Approx. 20 days",
        condition: "Overheating risk; thermal stress may reduce motor lifespan",
        color: "text-red-600",
      });
    if (speed > 5000)
      predictions.push({
        name: "Spindle Assembly",
        days: "Approx. 15 days",
        condition: "Overspeed operation detected; risk of mechanical wear",
        color: "text-red-600",
      });
    if (predictions.length === 0)
      predictions.push({
        name: "All Components",
        days: "120+ days",
        condition: "Stable operation with normal wear expected",
        color: "text-green-600",
      });

    setFuturePredictions(predictions);
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        {/* Header */}
        <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Real-time monitoring and AI-powered insights for your CNC machine
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Alerts */}
            <Card className="p-6 border-l-4 border-red-500 bg-red-50">
              <h3 className="text-lg font-semibold mb-3 text-red-700">
                Real-Time Alerts
              </h3>
              {alerts.length === 0 ? (
                <p className="text-gray-500">No active alerts</p>
              ) : (
                <ul className="space-y-2">
                  {alerts.map((alert, index) => (
                    <li key={index} className="text-red-600 font-medium">
                      {alert.message}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Health Score */}
            <Card className="p-6">
              <h3 className="text-sm uppercase font-semibold text-gray-500 mb-3">
                Overall Health Score
              </h3>
              <div className={`text-4xl font-bold ${healthColor}`}>
                {healthScore}%
              </div>
            </Card>

            {/* AI Diagnosis */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={18} />
                <h3 className="font-semibold">AI Diagnosis</h3>
              </div>
              <div className="space-y-3">
                {diagnoses.map((issue, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border",
                      issue === "Machine Operating Normally"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    )}
                  >
                    {issue}
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Sensor Data */}
            <Card className="p-6">
              <h3 className="text-sm uppercase font-semibold text-gray-500 mb-6">
                Live Sensor Dashboard
              </h3>
              {!liveData ? (
                <p className="text-gray-500">Waiting for live data...</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer size={18} />
                      <span>Temperature</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {liveData.temperature} °C
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge size={18} />
                      <span>Vibration</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {liveData.vibration} mm/s
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={18} />
                      <span>Spindle Speed</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {liveData.spindleSpeed} RPM
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Preventive Maintenance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preventive Maintenance</h3>
              <div className="space-y-4">
                {preventiveTasks.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.task}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          item.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : item.priority === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        )}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{item.due}</p>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Future Failure Prediction */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Future Failure Prediction</h3>
              <div className="space-y-4">
                {futurePredictions.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Estimated life remaining</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-2xl font-bold", item.color)}>{item.days}</p>
                      <p className="text-xs text-gray-500">{item.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}