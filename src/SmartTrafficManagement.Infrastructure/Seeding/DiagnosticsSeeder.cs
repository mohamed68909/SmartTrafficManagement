using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Infrastructure.Persistence;

namespace SmartTrafficManagement.Infrastructure.Seeding;

/// <summary>
/// Seeds the Expert-System decision tree derived from the CLIPS vehicle-system.clp knowledge base.
/// 14 diagnostic questions → 13 known problems with solutions and recommended service types.
/// </summary>
public static class DiagnosticsSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Idempotent: skip if already seeded
        if (await db.DiagnosticQuestions.AnyAsync()) return;

        // ──────────────────────────────────────────────────────────────────────
        // RESULTS  (13 problems from the CLIPS knowledge base)
        // ──────────────────────────────────────────────────────────────────────

        var rWeakBattery = new DiagnosticResult
        {
            Title                  = "Weak Battery",
            Description            = "The battery is weak — likely due to age or a faulty charging system. You hear clicking sounds when starting.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "High",
            Tip                    = "Charge or replace the battery. Do not attempt long trips."
        };

        var rDeadBattery = new DiagnosticResult
        {
            Title                  = "Dead Battery",
            Description            = "The battery is completely dead — the engine does not start and the battery warning light is on.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "High",
            Tip                    = "Replace the battery immediately or call a towing service."
        };

        var rRadiator = new DiagnosticResult
        {
            Title                  = "Radiator Failure",
            Description            = "The radiator is failing — the engine overheats and coolant may be leaking.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "High",
            Tip                    = "Stop driving and check coolant level. Tow to a mechanic."
        };

        var rMisfire = new DiagnosticResult
        {
            Title                  = "Engine Misfire",
            Description            = "The engine is misfiring — black smoke, strange noises, and vibrations are present.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Medium",
            Tip                    = "Check injectors and spark plugs as soon as possible."
        };

        var rSparkPlug = new DiagnosticResult
        {
            Title                  = "Spark Plug Failure",
            Description            = "One or more spark plugs have failed — causing engine vibration and high fuel consumption.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Medium",
            Tip                    = "Replace spark plugs. Avoid highway driving until fixed."
        };

        var rInjector = new DiagnosticResult
        {
            Title                  = "Fuel Injector Problem",
            Description            = "Fuel injectors are clogged or faulty — producing black smoke and consuming extra fuel.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Medium",
            Tip                    = "Clean or replace fuel injectors at the next service."
        };

        var rFuelPump = new DiagnosticResult
        {
            Title                  = "Fuel Pump Failure",
            Description            = "The fuel pump has failed — the vehicle stops suddenly and does not restart.",
            RecommendedServiceType = "Towing",
            Urgency                = "High",
            Tip                    = "Do not attempt to restart repeatedly. Request a tow truck."
        };

        var rBrake = new DiagnosticResult
        {
            Title                  = "Brake Failure",
            Description            = "Brake pads or discs are worn — you hear grinding noises when braking.",
            RecommendedServiceType = "Emergency",
            Urgency                = "High",
            Tip                    = "Avoid high speeds. Have brakes inspected immediately."
        };

        var rSteering = new DiagnosticResult
        {
            Title                  = "Power Steering Failure",
            Description            = "The power steering pump or fluid is faulty — steering is heavy or erratic.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Medium",
            Tip                    = "Check steering fluid level and pump condition."
        };

        var rTransmission = new DiagnosticResult
        {
            Title                  = "Transmission Failure",
            Description            = "The transmission system is failing — gear changes are rough or impossible.",
            RecommendedServiceType = "Towing",
            Urgency                = "High",
            Tip                    = "Avoid driving. Request a tow to a specialist workshop."
        };

        var rOilLeak = new DiagnosticResult
        {
            Title                  = "Engine Oil Leak",
            Description            = "Engine oil is leaking — you may see spots on the ground or smell burning oil.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "High",
            Tip                    = "Repair the leak immediately to prevent engine damage."
        };

        var rAC = new DiagnosticResult
        {
            Title                  = "Air Conditioner Failure",
            Description            = "The AC compressor or refrigerant gas is faulty — the system blows warm air.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Low",
            Tip                    = "Check AC compressor and refrigerant gas level."
        };

        var rExhaust = new DiagnosticResult
        {
            Title                  = "Exhaust System Problem",
            Description            = "The exhaust system is damaged — bad smells and black smoke from the rear.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Medium",
            Tip                    = "Inspect the exhaust pipe, catalytic converter, and muffler."
        };

        var rNoIssue = new DiagnosticResult
        {
            Title                  = "No Critical Issue Detected",
            Description            = "Based on your answers, no critical problem was detected. Your vehicle appears to be in normal condition.",
            RecommendedServiceType = "Maintenance",
            Urgency                = "Low",
            Tip                    = "Consider a routine service check to ensure everything is fine."
        };

        await db.DiagnosticResults.AddRangeAsync(
            rWeakBattery, rDeadBattery, rRadiator, rMisfire, rSparkPlug, rInjector,
            rFuelPump, rBrake, rSteering, rTransmission, rOilLeak, rAC, rExhaust, rNoIssue);
        await db.SaveChangesAsync();

        // ──────────────────────────────────────────────────────────────────────
        // QUESTIONS  (14 diagnostic questions from the CLIPS system)
        // Each question is created first so we can reference its Id in answers.
        // ──────────────────────────────────────────────────────────────────────

        var qEngine      = new DiagnosticQuestion { Text = "Does the engine start?",                   Order = 1,  IsRoot = true };
        var qBattery     = new DiagnosticQuestion { Text = "Is the battery warning light ON?",          Order = 2  };
        var qClickNoise  = new DiagnosticQuestion { Text = "Do you hear a clicking sound when starting?", Order = 3 };
        var qOverheat    = new DiagnosticQuestion { Text = "Is the engine overheating?",                Order = 4  };
        var qCoolant     = new DiagnosticQuestion { Text = "Is there a coolant / water leak?",          Order = 5  };
        var qSmoke       = new DiagnosticQuestion { Text = "What color is the exhaust smoke?",          Order = 6  };
        var qNoise       = new DiagnosticQuestion { Text = "Do you hear any strange noise from the engine?", Order = 7 };
        var qVibration   = new DiagnosticQuestion { Text = "Is the engine vibrating unusually?",        Order = 8  };
        var qFuel        = new DiagnosticQuestion { Text = "Is fuel consumption higher than normal?",   Order = 9  };
        var qStop        = new DiagnosticQuestion { Text = "Does the vehicle stop suddenly without warning?", Order = 10 };
        var qBrake       = new DiagnosticQuestion { Text = "Do you have a brake problem (hard pedal / grinding noise)?", Order = 11 };
        var qSteering    = new DiagnosticQuestion { Text = "Do you have a steering problem (heavy / pulling)?",          Order = 12 };
        var qTrans       = new DiagnosticQuestion { Text = "Do you have a transmission / gear-change problem?",          Order = 13 };
        var qAC          = new DiagnosticQuestion { Text = "Is the air conditioning NOT working?",      Order = 14 };

        await db.DiagnosticQuestions.AddRangeAsync(
            qEngine, qBattery, qClickNoise, qOverheat, qCoolant,
            qSmoke, qNoise, qVibration, qFuel, qStop,
            qBrake, qSteering, qTrans, qAC);
        await db.SaveChangesAsync();

        // ──────────────────────────────────────────────────────────────────────
        // ANSWERS  (wiring the decision tree)
        // ──────────────────────────────────────────────────────────────────────

        var answers = new List<DiagnosticAnswer>
        {
            // Q1: Does engine start?
            //   No  → Q2 (battery check)
            //   Yes → Q4 (overheating)
            new() { QuestionId = qEngine.Id,     Text = "No",  NextQuestionId = qBattery.Id   },
            new() { QuestionId = qEngine.Id,     Text = "Yes", NextQuestionId = qOverheat.Id  },

            // Q2: Battery light ON?
            //   Yes → Q3 (clicking sound)
            //   No  → Result: Fuel Pump Failure (engine won't start, no battery light)
            new() { QuestionId = qBattery.Id,    Text = "Yes", NextQuestionId = qClickNoise.Id },
            new() { QuestionId = qBattery.Id,    Text = "No",  ResultId       = rFuelPump.Id   },

            // Q3: Clicking sound?
            //   Yes → Result: Weak Battery
            //   No  → Result: Dead Battery
            new() { QuestionId = qClickNoise.Id, Text = "Yes (clicking sound)", ResultId = rWeakBattery.Id },
            new() { QuestionId = qClickNoise.Id, Text = "No clicking sound",    ResultId = rDeadBattery.Id },

            // Q4: Overheating?
            //   Yes → Q5 (coolant leak)
            //   No  → Q6 (smoke)
            new() { QuestionId = qOverheat.Id,   Text = "Yes", NextQuestionId = qCoolant.Id },
            new() { QuestionId = qOverheat.Id,   Text = "No",  NextQuestionId = qSmoke.Id  },

            // Q5: Coolant leak?
            //   Yes → Result: Radiator Failure
            //   No  → Q6 (continue)
            new() { QuestionId = qCoolant.Id,    Text = "Yes", ResultId       = rRadiator.Id },
            new() { QuestionId = qCoolant.Id,    Text = "No",  NextQuestionId = qSmoke.Id   },

            // Q6: Smoke color?
            //   Black → Q7 (strange noise)
            //   None  → Q9 (fuel consumption)
            new() { QuestionId = qSmoke.Id,      Text = "Black smoke", NextQuestionId = qNoise.Id  },
            new() { QuestionId = qSmoke.Id,      Text = "No smoke",    NextQuestionId = qFuel.Id   },

            // Q7: Strange noise?
            //   Yes → Q8 (vibration) → could be misfire
            //   No  → Result: Fuel Injector (black smoke, no noise)
            new() { QuestionId = qNoise.Id,      Text = "Yes", NextQuestionId = qVibration.Id },
            new() { QuestionId = qNoise.Id,      Text = "No",  ResultId       = rInjector.Id  },

            // Q8: Engine vibration?
            //   Yes → Result: Engine Misfire
            //   No  → Result: Exhaust System Problem
            new() { QuestionId = qVibration.Id,  Text = "Yes", ResultId = rMisfire.Id  },
            new() { QuestionId = qVibration.Id,  Text = "No",  ResultId = rExhaust.Id  },

            // Q9: High fuel consumption?
            //   Yes → Result: Spark Plug Failure
            //   No  → Q10 (stops suddenly)
            new() { QuestionId = qFuel.Id,       Text = "Yes (higher than normal)", ResultId       = rSparkPlug.Id },
            new() { QuestionId = qFuel.Id,       Text = "No (normal)",              NextQuestionId = qStop.Id      },

            // Q10: Stops suddenly?
            //   Yes → Result: Fuel Pump Failure (stops + hard restart)
            //   No  → Q11 (brake)
            new() { QuestionId = qStop.Id,       Text = "Yes", ResultId       = rFuelPump.Id },
            new() { QuestionId = qStop.Id,       Text = "No",  NextQuestionId = qBrake.Id   },

            // Q11: Brake problem?
            //   Yes → Result: Brake Failure
            //   No  → Q12 (steering)
            new() { QuestionId = qBrake.Id,      Text = "Yes", ResultId       = rBrake.Id    },
            new() { QuestionId = qBrake.Id,      Text = "No",  NextQuestionId = qSteering.Id },

            // Q12: Steering problem?
            //   Yes → Result: Power Steering Failure
            //   No  → Q13 (transmission)
            new() { QuestionId = qSteering.Id,   Text = "Yes", ResultId       = rSteering.Id  },
            new() { QuestionId = qSteering.Id,   Text = "No",  NextQuestionId = qTrans.Id     },

            // Q13: Transmission problem?
            //   Yes → Result: Transmission Failure
            //   No  → Q14 (AC)
            new() { QuestionId = qTrans.Id,      Text = "Yes", ResultId       = rTransmission.Id },
            new() { QuestionId = qTrans.Id,      Text = "No",  NextQuestionId = qAC.Id          },

            // Q14: AC not working?
            //   Yes → Result: AC Failure
            //   No  → Result: No Critical Issue
            new() { QuestionId = qAC.Id,         Text = "Yes (AC not working)",  ResultId = rAC.Id      },
            new() { QuestionId = qAC.Id,         Text = "No (AC working fine)",  ResultId = rNoIssue.Id },
        };

        await db.DiagnosticAnswers.AddRangeAsync(answers);
        await db.SaveChangesAsync();
    }
}
