;; =====================================================
;;        VEHICLE TROUBLESHOOTING EXPERT SYSTEM
;; =====================================================

;; =====================================================
;; 1. Templates
;; =====================================================

(deftemplate vehicle
   (slot engine-starts)
   (slot battery-light)
   (slot overheating)
   (slot smoke-color)
   (slot strange-noise)
   (slot fuel-consumption)
   (slot brake-problem)
   (slot engine-vibration)
   (slot vehicle-stops-suddenly)
   (slot oil-leak)
   (slot steering-problem)
   (slot transmission-problem)
   (slot air-conditioner-working)
   (slot exhaust-smell)
)

(deftemplate problem
   (slot name)
   (multislot symptoms)
   (slot solution)
)

(deftemplate diagnosis
   (slot issue)
)

;; =====================================================
;; 2. Function
;; =====================================================

(deffunction count-matches (?vehicle-symptoms ?problem-symptoms)

   (bind ?count 0)

   (foreach ?s ?vehicle-symptoms

      (if (member$ ?s ?problem-symptoms) then
         (bind ?count (+ ?count 1))
      )

   )

   (return ?count)
)

;; =====================================================
;; 3. Knowledge Base
;; =====================================================

(deffacts vehicle-problems

   ;; Battery Problems
   (problem
      (name "Weak Battery")
      (symptoms "NotStarting" "BatteryLightOn" "ClickingNoise")
      (solution "Charge or replace the battery")
   )

   (problem
      (name "Dead Battery")
      (symptoms "NotStarting" "BatteryLightOn")
      (solution "Replace the battery")
   )

   ;; Cooling Problems
   (problem
      (name "Radiator Failure")
      (symptoms "Overheating" "CoolantLeak")
      (solution "Check radiator and coolant")
   )

   ;; Engine Problems
   (problem
      (name "Engine Misfire")
      (symptoms "BlackSmoke" "StrangeNoise" "EngineVibration")
      (solution "Check injectors and spark plugs")
   )

   (problem
      (name "Spark Plug Failure")
      (symptoms "EngineVibration" "HighFuelConsumption")
      (solution "Replace spark plugs")
   )

   (problem
      (name "Fuel Injector Problem")
      (symptoms "BlackSmoke" "HighFuelConsumption")
      (solution "Clean or replace fuel injectors")
   )

   ;; Fuel System
   (problem
      (name "Fuel Pump Failure")
      (symptoms "StopsSuddenly" "NotStarting")
      (solution "Replace fuel pump")
   )

   ;; Brake Problems
   (problem
      (name "Brake Failure")
      (symptoms "BrakeProblem" "StrangeNoise")
      (solution "Inspect brake pads")
   )

   ;; Steering Problems
   (problem
      (name "Power Steering Failure")
      (symptoms "SteeringProblem")
      (solution "Check steering fluid and pump")
   )

   ;; Transmission Problems
   (problem
      (name "Transmission Failure")
      (symptoms "TransmissionProblem" "StrangeNoise")
      (solution "Inspect transmission system")
   )

   ;; Oil Problems
   (problem
      (name "Engine Oil Leak")
      (symptoms "OilLeak")
      (solution "Repair oil leakage immediately")
   )

   ;; Air Conditioner
   (problem
      (name "Air Conditioner Failure")
      (symptoms "ACNotWorking")
      (solution "Check AC compressor and gas")
   )

   ;; Exhaust Problems
   (problem
      (name "Exhaust System Problem")
      (symptoms "BadExhaustSmell" "BlackSmoke")
      (solution "Inspect exhaust system")
   )
)

;; =====================================================
;; 4. Diagnosis Rule
;; =====================================================

(defrule diagnose-problem

   (vehicle
      (engine-starts ?start)
      (battery-light ?battery)
      (overheating ?heat)
      (smoke-color ?smoke)
      (strange-noise ?noise)
      (fuel-consumption ?fuel)
      (brake-problem ?brake)
      (engine-vibration ?vibration)
      (vehicle-stops-suddenly ?stop)
      (oil-leak ?oil)
      (steering-problem ?steer)
      (transmission-problem ?trans)
      (air-conditioner-working ?ac)
      (exhaust-smell ?smell)
   )

   (problem
      (name ?problem-name)
      (symptoms $?problem-symptoms)
      (solution ?solution)
   )

   (not (diagnosis (issue ?problem-name)))

   (test

      (>=

         (count-matches

            (create$

               (if (eq ?start no) then "NotStarting" else "")
               (if (eq ?battery yes) then "BatteryLightOn" else "")
               (if (eq ?heat yes) then "Overheating" else "")
               (if (eq ?smoke black) then "BlackSmoke" else "")
               (if (eq ?noise yes) then "StrangeNoise" else "")
               (if (eq ?fuel high) then "HighFuelConsumption" else "")
               (if (eq ?brake yes) then "BrakeProblem" else "")
               (if (eq ?vibration yes) then "EngineVibration" else "")
               (if (eq ?stop yes) then "StopsSuddenly" else "")
               (if (eq ?oil yes) then "OilLeak" else "")
               (if (eq ?steer yes) then "SteeringProblem" else "")
               (if (eq ?trans yes) then "TransmissionProblem" else "")
               (if (eq ?ac no) then "ACNotWorking" else "")
               (if (eq ?smell yes) then "BadExhaustSmell" else "")

            )

            $?problem-symptoms

         )

         2

      )

   )

=>

   (printout t crlf)
   (printout t "==========================================" crlf)
   (printout t "VEHICLE DIAGNOSIS RESULT" crlf)
   (printout t "------------------------------------------" crlf)
   (printout t "Detected Problem: " ?problem-name crlf)
   (printout t "Suggested Solution: " ?solution crlf)
   (printout t "==========================================" crlf)

   (assert (diagnosis (issue ?problem-name)))
)

;; =====================================================
;; 5. No Match Rule
;; =====================================================

(defrule no-problem-found

   (declare (salience -10))

   (vehicle)

   (not (diagnosis (issue ?)))

=>

   (printout t
      "No exact problem detected. More inspection is needed."
      crlf)
)

;; =====================================================
;; 6. Save Vehicle Data Automatically
;; =====================================================

(defrule save-vehicle-data

   (vehicle
      (engine-starts ?start)
      (battery-light ?battery)
      (overheating ?heat)
      (smoke-color ?smoke)
      (strange-noise ?noise)
      (fuel-consumption ?fuel)
      (brake-problem ?brake)
      (engine-vibration ?vibration)
      (vehicle-stops-suddenly ?stop)
      (oil-leak ?oil)
      (steering-problem ?steer)
      (transmission-problem ?trans)
      (air-conditioner-working ?ac)
      (exhaust-smell ?smell)
   )

=>

   (open
      "C:/Users/m6377/OneDrive/Desktop/vehicle_history.txt"
      vehicle-file
      "a"
   )

   (printout vehicle-file crlf)
   (printout vehicle-file "===== VEHICLE DATA =====" crlf)

   (printout vehicle-file "Engine Starts: " ?start crlf)
   (printout vehicle-file "Battery Light: " ?battery crlf)
   (printout vehicle-file "Overheating: " ?heat crlf)
   (printout vehicle-file "Smoke Color: " ?smoke crlf)
   (printout vehicle-file "Strange Noise: " ?noise crlf)
   (printout vehicle-file "Fuel Consumption: " ?fuel crlf)
   (printout vehicle-file "Brake Problem: " ?brake crlf)
   (printout vehicle-file "Engine Vibration: " ?vibration crlf)
   (printout vehicle-file "Stops Suddenly: " ?stop crlf)
   (printout vehicle-file "Oil Leak: " ?oil crlf)
   (printout vehicle-file "Steering Problem: " ?steer crlf)
   (printout vehicle-file "Transmission Problem: " ?trans crlf)
   (printout vehicle-file "AC Working: " ?ac crlf)
   (printout vehicle-file "Exhaust Smell: " ?smell crlf)

   (close vehicle-file)

   (printout t crlf)
   (printout t "Vehicle data saved successfully." crlf)
)

;; =====================================================
;; 7. Interactive Diagnosis
;; =====================================================

(deffunction start-diagnosis ()

   (printout t crlf)
   (printout t "===== VEHICLE DIAGNOSIS SYSTEM =====" crlf crlf)

   ;; Engine
   (printout t "Does the engine start? (yes/no): ")
   (bind ?start (read))

   ;; Battery
   (printout t "Is the battery light ON? (yes/no): ")
   (bind ?battery (read))

   ;; Heat
   (printout t "Is the engine overheating? (yes/no): ")
   (bind ?heat (read))

   ;; Smoke
   (printout t "Smoke color? (black/none): ")
   (bind ?smoke (read))

   ;; Noise
   (printout t "Any strange noise? (yes/no): ")
   (bind ?noise (read))

   ;; Fuel
   (printout t "Fuel consumption? (high/normal): ")
   (bind ?fuel (read))

   ;; Brake
   (printout t "Brake problem? (yes/no): ")
   (bind ?brake (read))

   ;; Vibration
   (printout t "Engine vibration? (yes/no): ")
   (bind ?vibration (read))

   ;; Stop
   (printout t "Does the vehicle stop suddenly? (yes/no): ")
   (bind ?stop (read))

   ;; Oil
   (printout t "Any oil leak? (yes/no): ")
   (bind ?oil (read))

   ;; Steering
   (printout t "Steering problem? (yes/no): ")
   (bind ?steer (read))

   ;; Transmission
   (printout t "Transmission problem? (yes/no): ")
   (bind ?trans (read))

   ;; AC
   (printout t "Is AC working? (yes/no): ")
   (bind ?ac (read))

   ;; Exhaust
   (printout t "Bad exhaust smell? (yes/no): ")
   (bind ?smell (read))

   ;; Store data
   (assert

      (vehicle

         (engine-starts ?start)
         (battery-light ?battery)
         (overheating ?heat)
         (smoke-color ?smoke)
         (strange-noise ?noise)
         (fuel-consumption ?fuel)
         (brake-problem ?brake)
         (engine-vibration ?vibration)
         (vehicle-stops-suddenly ?stop)
         (oil-leak ?oil)
         (steering-problem ?steer)
         (transmission-problem ?trans)
         (air-conditioner-working ?ac)
         (exhaust-smell ?smell)

      )
   )

   ;; Run rules
   (run)
)

;; =====================================================
;; 8. Main Menu
;; =====================================================

(deffunction main-menu ()

   (printout t crlf)
   (printout t "==================================" crlf)
   (printout t " VEHICLE EXPERT SYSTEM " crlf)
   (printout t "==================================" crlf)
   (printout t "1 - Interactive Diagnosis" crlf)
   (printout t "2 - Manual Diagnosis" crlf)
   (printout t "Choose option: ")

   (bind ?choice (read))

   (if (eq ?choice 1)
      then
         (start-diagnosis)

      else

         (printout t crlf)
         (printout t "Use assert(...) then type (run)" crlf)
   )
)

;; =====================================================
;; 9. HOW TO RUN
;; =====================================================

;; (clear)

;; (load "C:/Users/m6377/OneDrive/Desktop/vehicle-system.clp")

;; (reset)

;; (main-menu)

;; =====================================================
;; END OF PROJECT
;; =====================================================