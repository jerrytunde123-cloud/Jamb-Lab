// JAMB Standard Questions Database
const quizData = {
    english: {
        name: "English Language",
        icon: "📖",
        questions: [
            {
                question: "Choose the option nearest in meaning to the word in italics: The governor's speech was characterized by circumlocution.",
                options: ["Directness", "Verbosity", "Simplicity", "Clarity"],
                correct: 1
            },
            {
                question: "Select the word that is most nearly opposite in meaning to 'Benevolent'",
                options: ["Kind", "Generous", "Malevolent", "Charitable"],
                correct: 2
            },
            {
                question: "Choose the correct option to complete the sentence: Neither the teacher nor the students ______ present.",
                options: ["was", "were", "is", "has been"],
                correct: 1
            },
            {
                question: "Identify the figure of speech: 'The wind whispered through the trees'",
                options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
                correct: 2
            },
            {
                question: "Choose the option with correct spelling:",
                options: ["Accomodation", "Accommodation", "Acommodation", "Accommodetion"],
                correct: 1
            },
            {
                question: "Select the appropriate preposition: He has been suffering ______ malaria for two weeks.",
                options: ["of", "from", "with", "by"],
                correct: 1
            },
            {
                question: "Choose the word that best completes the sentence: The ______ of the matter is that we need more time.",
                options: ["truth", "fact", "reality", "essence"],
                correct: 3
            },
            {
                question: "Identify the type of sentence: 'If I were you, I would study harder'",
                options: ["Conditional", "Declarative", "Interrogative", "Imperative"],
                correct: 0
            },
            {
                question: "Choose the correct form: The committee ______ divided in their opinions.",
                options: ["is", "are", "was", "has"],
                correct: 1
            },
            {
                question: "Select the word with the same vowel sound as 'beat':",
                options: ["Bet", "Bait", "Bit", "Seat"],
                correct: 3
            }
        ]
    },
    
    mathematics: {
        name: "Mathematics",
        icon: "📐",
        questions: [
            {
                question: "If x² + 5x - 14 = 0, find the values of x.",
                options: ["x = 2 or -7", "x = -2 or 7", "x = 1 or -14", "x = -1 or 14"],
                correct: 0
            },
            {
                question: "Find the derivative of f(x) = 3x³ - 2x² + 5x - 7",
                options: ["9x² - 4x + 5", "6x² - 4x + 5", "9x² + 4x + 5", "3x² - 2x + 5"],
                correct: 0
            },
            {
                question: "In a class of 40 students, 25 study Mathematics and 20 study Physics. If 10 study both, how many study neither?",
                options: ["5", "10", "15", "20"],
                correct: 0
            },
            {
                question: "Find the value of log₂16",
                options: ["2", "4", "8", "16"],
                correct: 1
            },
            {
                question: "The sum of the first n terms of an AP is 3n² + n. Find the first term.",
                options: ["3", "4", "5", "6"],
                correct: 1
            },
            {
                question: "If sin θ = 3/5 and θ is acute, find cos θ.",
                options: ["3/5", "4/5", "5/4", "5/3"],
                correct: 1
            },
            {
                question: "Simplify: (3x²y³)⁴",
                options: ["81x⁸y¹²", "12x⁶y⁷", "81x⁶y⁷", "12x⁸y¹²"],
                correct: 0
            },
            {
                question: "A die is rolled. What is the probability of getting an even number?",
                options: ["1/6", "1/3", "1/2", "2/3"],
                correct: 2
            },
            {
                question: "Find the inverse of the matrix [[2,1],[5,3]]",
                options: ["[[3,-1],[-5,2]]", "[[3,1],[5,2]]", "[[-3,1],[5,-2]]", "[[3,-1],[5,-2]]"],
                correct: 0
            },
            {
                question: "The mean of five numbers is 12. If four of the numbers are 8, 10, 13, and 15, find the fifth number.",
                options: ["12", "14", "16", "18"],
                correct: 1
            }
        ]
    },
    
    physics: {
        name: "Physics",
        icon: "⚡",
        questions: [
            {
                question: "A body of mass 2kg is moving with a velocity of 4 m/s. Calculate its kinetic energy.",
                options: ["8 J", "16 J", "32 J", "4 J"],
                correct: 1
            },
            {
                question: "The SI unit of electric current is:",
                options: ["Volt", "Ohm", "Ampere", "Watt"],
                correct: 2
            },
            {
                question: "Which of the following is a scalar quantity?",
                options: ["Force", "Velocity", "Acceleration", "Mass"],
                correct: 3
            },
            {
                question: "The acceleration due to gravity on Earth is approximately:",
                options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "7.8 m/s²"],
                correct: 1
            },
            {
                question: "A transformer works on the principle of:",
                options: ["Self induction", "Mutual induction", "Electrostatic induction", "Magnetic induction"],
                correct: 1
            },
            {
                question: "The speed of light in vacuum is approximately:",
                options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
                correct: 0
            },
            {
                question: "Which of these is not a fundamental quantity?",
                options: ["Length", "Mass", "Time", "Force"],
                correct: 3
            },
            {
                question: "The frequency of a wave with period 0.02s is:",
                options: ["20 Hz", "50 Hz", "0.02 Hz", "500 Hz"],
                correct: 1
            },
            {
                question: "A convex lens has a focal length of 10cm. An object is placed 15cm from the lens. The image is:",
                options: ["Real and inverted", "Virtual and erect", "Real and erect", "Virtual and inverted"],
                correct: 0
            },
            {
                question: "The energy stored in a capacitor is given by:",
                options: ["½CV²", "CV²", "½CV", "2CV²"],
                correct: 0
            }
        ]
    },
    
    chemistry: {
        name: "Chemistry",
        icon: "🧪",
        questions: [
            {
                question: "The atomic number of an element is determined by the number of:",
                options: ["Neutrons", "Protons", "Electrons", "Nucleons"],
                correct: 1
            },
            {
                question: "Which of the following is a noble gas?",
                options: ["Oxygen", "Nitrogen", "Argon", "Chlorine"],
                correct: 2
            },
            {
                question: "The pH of a neutral solution at 25°C is:",
                options: ["0", "7", "14", "1"],
                correct: 1
            },
            {
                question: "The process of converting solid directly to gas is called:",
                options: ["Evaporation", "Condensation", "Sublimation", "Deposition"],
                correct: 2
            },
            {
                question: "Which bond is formed by the transfer of electrons?",
                options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"],
                correct: 1
            },
            {
                question: "The chemical formula for glucose is:",
                options: ["C₆H₁₂O₆", "C₆H₆O₆", "C₁₂H₂₂O₁₁", "CH₃COOH"],
                correct: 0
            },
            {
                question: "Which of the following is an exothermic reaction?",
                options: ["Photosynthesis", "Combustion", "Melting of ice", "Evaporation"],
                correct: 1
            },
            {
                question: "The most abundant element in the Earth's crust is:",
                options: ["Iron", "Silicon", "Oxygen", "Aluminium"],
                correct: 2
            },
            {
                question: "What is the oxidation state of Mn in KMnO₄?",
                options: ["+2", "+4", "+6", "+7"],
                correct: 3
            },
            {
                question: "The rate of a chemical reaction increases with temperature because:",
                options: ["Reactants become lighter", "More collisions occur", "Products become unstable", "Catalysts are formed"],
                correct: 1
            }
        ]
    },
    
    biology: {
        name: "Biology",
        icon: "🧬",
        questions: [
            {
                question: "The powerhouse of the cell is the:",
                options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
                correct: 2
            },
            {
                question: "Which blood group is known as the universal donor?",
                options: ["A", "B", "AB", "O"],
                correct: 3
            },
            {
                question: "Photosynthesis occurs mainly in the:",
                options: ["Roots", "Stem", "Leaves", "Flowers"],
                correct: 2
            },
            {
                question: "The functional unit of the kidney is:",
                options: ["Neuron", "Nephron", "Alveolus", "Villi"],
                correct: 1
            },
            {
                question: "Which of the following is NOT a carbohydrate?",
                options: ["Glucose", "Starch", "Cellulose", "Insulin"],
                correct: 3
            },
            {
                question: "The process of cell division in somatic cells is called:",
                options: ["Meiosis", "Mitosis", "Binary fission", "Budding"],
                correct: 1
            },
            {
                question: "Which organ produces insulin?",
                options: ["Liver", "Kidney", "Pancreas", "Spleen"],
                correct: 2
            },
            {
                question: "The genetic material in living organisms is:",
                options: ["RNA", "DNA", "Protein", "Lipid"],
                correct: 1
            },
            {
                question: "Respiration that requires oxygen is called:",
                options: ["Anaerobic", "Aerobic", "Fermentation", "Glycolysis"],
                correct: 1
            },
            {
                question: "The smallest unit of life is:",
                options: ["Atom", "Molecule", "Cell", "Tissue"],
                correct: 2
            }
        ]
    }
},
    
    government: {
        name: "Government",
        icon: "🏛️",
        questions: [
            {
                question: "The principle that the powers of government should be divided among the three arms is called:",
                options: ["Separation of powers", "Federalism", "Rule of law", "Sovereignty"],
                correct: 0
            },
            {
                question: "In a federal system, residual powers are exercised by:",
                options: ["State governments", "Federal government", "Local governments", "Both federal and state"],
                correct: 0
            },
            {
                question: "The concept of 'rule of law' was propounded by:",
                options: ["A.V. Dicey", "John Locke", "Thomas Hobbes", "Jean Bodin"],
                correct: 0
            },
            {
                question: "The process by which a bill becomes law after presidential assent is called:",
                options: ["Legislation", "Adjudication", "Execution", "Delegation"],
                correct: 0
            },
            {
                question: "A constitution that can be amended by a simple majority in parliament is:",
                options: ["Flexible constitution", "Rigid constitution", "Written constitution", "Unwritten constitution"],
                correct: 0
            },
            {
                question: "The doctrine that the state should not interfere in the economic activities of citizens is:",
                options: ["Laissez-faire", "Socialism", "Communism", "Welfarism"],
                correct: 0
            },
            {
                question: "The upper legislative chamber in Nigeria is called:",
                options: ["Senate", "House of Representatives", "National Assembly", "Council of State"],
                correct: 0
            },
            {
                question: "The type of government in which the king or queen is the ceremonial head of state is:",
                options: ["Constitutional monarchy", "Absolute monarchy", "Republic", "Oligarchy"],
                correct: 0
            },
            {
                question: "The process of redrawing constituency boundaries is called:",
                options: ["Delimitation", "Gerrymandering", "Franchise", "Registration"],
                correct: 0
            },
            {
                question: "The principle of collective responsibility applies to:",
                options: ["Cabinet ministers", "Judges", "Civil servants", "Members of parliament"],
                correct: 0
            }
        ]
    },

    economics: {
        name: "Economics",
        icon: "📊",
        questions: [
            {
                question: "If the price of a commodity increases from ₦10 to ₦12 and quantity demanded falls from 100 to 80 units, calculate the price elasticity of demand.",
                options: ["1.0", "0.5", "2.0", "1.5"],
                correct: 0
            },
            {
                question: "The point where demand and supply curves intersect is called:",
                options: ["Equilibrium point", "Break-even point", "Maximum point", "Minimum point"],
                correct: 0
            },
            {
                question: "If the marginal propensity to consume is 0.8, the multiplier is:",
                options: ["5", "4", "2", "8"],
                correct: 0
            },
            {
                question: "A situation where inflation coexists with unemployment is called:",
                options: ["Stagflation", "Deflation", "Disinflation", "Hyperinflation"],
                correct: 0
            },
            {
                question: "The relationship between price and quantity supplied is:",
                options: ["Direct", "Inverse", "Constant", "Undefined"],
                correct: 0
            },
            {
                question: "Calculate the GDP if consumption is ₦500m, investment is ₦200m, government spending is ₦300m, and net exports is ₦50m.",
                options: ["₦1,050m", "₦950m", "₦1,000m", "₦1,100m"],
                correct: 0
            },
            {
                question: "The type of unemployment caused by technological changes is:",
                options: ["Structural unemployment", "Frictional unemployment", "Cyclical unemployment", "Seasonal unemployment"],
                correct: 0
            },
            {
                question: "A tax that takes a larger proportion of income from low-income earners is:",
                options: ["Regressive tax", "Progressive tax", "Proportional tax", "Direct tax"],
                correct: 0
            },
            {
                question: "The type of market where there is only one buyer is:",
                options: ["Monopsony", "Monopoly", "Oligopoly", "Perfect competition"],
                correct: 0
            },
            {
                question: "A movement along the demand curve is caused by a change in:",
                options: ["Price of the commodity", "Income", "Taste", "Population"],
                correct: 0
            }
        ]
    },

    literature: {
        name: "Literature in English",
        icon: "📚",
        questions: [
            {
                question: "In 'Things Fall Apart', the death of Ikemefuna is significant because:",
                options: ["It marks the beginning of Okonkwo's downfall", "It brings peace to the village", "It strengthens Okonkwo's position", "It ends the war"],
                correct: 0
            },
            {
                question: "The literary device used in 'The moon is a queen' is:",
                options: ["Metaphor", "Simile", "Personification", "Hyperbole"],
                correct: 0
            },
            {
                question: "In 'The Lion and the Jewel', Lakunle represents:",
                options: ["Modernity", "Tradition", "Colonialism", "Nationalism"],
                correct: 0
            },
            {
                question: "A play that ends with the downfall of the protagonist is called:",
                options: ["Tragedy", "Comedy", "Farce", "Melodrama"],
                correct: 0
            },
            {
                question: "The narrator in a literary work who knows everything about the characters is:",
                options: ["Omniscient narrator", "First-person narrator", "Limited narrator", "Objective narrator"],
                correct: 0
            },
            {
                question: "The use of 'winter' to represent old age is an example of:",
                options: ["Symbolism", "Irony", "Satire", "Paradox"],
                correct: 0
            },
            {
                question: "A speech made by a character alone on stage is:",
                options: ["Soliloquy", "Monologue", "Dialogue", "Aside"],
                correct: 0
            },
            {
                question: "The literary term for a hint of future events is:",
                options: ["Foreshadowing", "Flashback", "Suspense", "Cliffhanger"],
                correct: 0
            },
            {
                question: "A poem of mourning for the dead is called:",
                options: ["Elegy", "Ode", "Sonnet", "Ballad"],
                correct: 0
            },
            {
                question: "The protagonist in a literary work is:",
                options: ["The main character", "The villain", "The narrator", "The author"],
                correct: 0
            }
        ]
    },

    crs: {
        name: "Christian Religious Studies",
        icon: "✝️",
        questions: [
            {
                question: "According to Matthew's Gospel, the Beatitudes were delivered on:",
                options: ["A mountain", "A plain", "A boat", "A synagogue"],
                correct: 0
            },
            {
                question: "The significance of the Transfiguration was to:",
                options: ["Reveal Jesus' divine nature", "Show Jesus' humanity", "Predict Jesus' death only", "Show Moses' superiority"],
                correct: 0
            },
            {
                question: "In the parable of the Good Samaritan, the point Jesus made was that:",
                options: ["Neighbourliness transcends ethnic boundaries", "Priests are evil", "Samaritans are holy", "Travel is dangerous"],
                correct: 0
            },
            {
                question: "The main lesson from the story of the Prodigal Son is:",
                options: ["God's forgiveness for repentant sinners", "The danger of wealth", "The importance of farming", "The role of elder brothers"],
                correct: 0
            },
            {
                question: "According to Paul, justification is by:",
                options: ["Faith in Jesus Christ", "Works of the law", "Circumcision", "Temple sacrifice"],
                correct: 0
            },
            {
                question: "The Holy Spirit descended on the apostles on the day of:",
                options: ["Pentecost", "Passover", "Tabernacles", "Atonement"],
                correct: 0
            },
            {
                question: "The main message of the prophet Amos was:",
                options: ["Social justice and righteousness", "Temple worship", "Kingship", "Sacrifice"],
                correct: 0
            },
            {
                question: "According to James, faith without works is:",
                options: ["Dead", "Alive", "Perfect", "Sufficient"],
                correct: 0
            },
            {
                question: "Paul's conversion occurred on the road to:",
                options: ["Damascus", "Jerusalem", "Rome", "Antioch"],
                correct: 0
            },
            {
                question: "According to Jesus, the greatest commandment is:",
                options: ["Love God and love your neighbour", "Honour your parents", "Do not steal", "Keep the Sabbath"],
                correct: 0
            }
        ]
    },

    geography: {
        name: "Geography",
        icon: "🌍",
        questions: [
            {
                question: "The process by which rocks are broken down by chemical reactions is:",
                options: ["Chemical weathering", "Physical weathering", "Biological weathering", "Erosion"],
                correct: 0
            },
            {
                question: "A line on a map joining points of equal rainfall is:",
                options: ["Isohyet", "Isotherm", "Isobar", "Contour"],
                correct: 0
            },
            {
                question: "The type of rainfall associated with the Inter-Tropical Convergence Zone is:",
                options: ["Convectional", "Relief", "Frontal", "Cyclonic"],
                correct: 0
            },
            {
                question: "The process by which a river deposits its load at its mouth is:",
                options: ["Delta formation", "Erosion", "Transportation", "Attrition"],
                correct: 0
            },
            {
                question: "A map scale of 1:50,000 means that 1cm on the map represents:",
                options: ["0.5 km", "5 km", "50 km", "500 km"],
                correct: 0
            },
            {
                question: "The phenomenon where the sun is directly overhead at the Tropic of Cancer occurs in:",
                options: ["June", "December", "March", "September"],
                correct: 0
            },
            {
                question: "The instrument used to measure atmospheric pressure is:",
                options: ["Barometer", "Thermometer", "Hygrometer", "Anemometer"],
                correct: 0
            },
            {
                question: "The main cause of tides in oceans is:",
                options: ["Gravitational pull of the moon", "Wind", "Earthquakes", "Ocean currents"],
                correct: 0
            },
            {
                question: "A plateau is best described as:",
                options: ["An elevated flat land", "A lowland plain", "A mountain peak", "A river valley"],
                correct: 0
            },
            {
                question: "The type of soil erosion caused by wind in arid regions is:",
                options: ["Aeolian erosion", "Fluvial erosion", "Glacial erosion", "Marine erosion"],
                correct: 0
            }
        ]
    },

    commerce: {
        name: "Commerce",
        icon: "💼",
        questions: [
            {
                question: "The function of commerce that involves moving goods from producers to consumers is:",
                options: ["Trade", "Aids to trade", "Production", "Manufacturing"],
                correct: 0
            },
            {
                question: "A document sent by a seller to a buyer requesting payment is:",
                options: ["Invoice", "Receipt", "Credit note", "Debit note"],
                correct: 0
            },
            {
                question: "The type of business organization where members share profits and losses is:",
                options: ["Partnership", "Sole proprietorship", "Public corporation", "Cooperative"],
                correct: 0
            },
            {
                question: "The principle of insurance where the insured must disclose all material facts is:",
                options: ["Utmost good faith", "Indemnity", "Subrogation", "Contribution"],
                correct: 0
            },
            {
                question: "The process of transporting goods by sea is called:",
                options: ["Shipping", "Freighting", "Haulage", "Carriage"],
                correct: 0
            },
            {
                question: "A document that serves as evidence of ownership of goods in transit is:",
                options: ["Bill of lading", "Invoice", "Waybill", "Consignment note"],
                correct: 0
            },
            {
                question: "A warehouse where goods are stored until duty is paid is:",
                options: ["Bonded warehouse", "Private warehouse", "Public warehouse", "Cooperative warehouse"],
                correct: 0
            },
            {
                question: "A cheque that has been crossed cannot be:",
                options: ["Cashed over the counter", "Deposited in a bank", "Endorsed", "Transferred"],
                correct: 0
            },
            {
                question: "The main advantage of a cooperative society is:",
                options: ["Members share profits equitably", "Government control", "Limited liability", "Large capital base"],
                correct: 0
            },
            {
                question: "The purpose of a trade mark is to:",
                options: ["Identify a product", "Advertise a product", "Price a product", "Distribute a product"],
                correct: 0
            }
        ]
    },

    financialAccounting: {
        name: "Financial Accounting",
        icon: "🧾",
        questions: [
            {
                question: "If assets are ₦500,000 and liabilities are ₦200,000, what is the owner's equity?",
                options: ["₦300,000", "₦700,000", "₦200,000", "₦500,000"],
                correct: 0
            },
            {
                question: "The accounting concept that requires transactions to be recorded at their original cost is:",
                options: ["Historical cost concept", "Going concern concept", "Matching concept", "Accrual concept"],
                correct: 0
            },
            {
                question: "A purchase of goods on credit will:",
                options: ["Increase assets and increase liabilities", "Decrease assets and decrease liabilities", "Increase assets only", "Decrease liabilities only"],
                correct: 0
            },
            {
                question: "The trial balance is prepared to:",
                options: ["Check the arithmetical accuracy of the ledger", "Determine profit", "Show financial position", "Record transactions"],
                correct: 0
            },
            {
                question: "If opening stock is ₦50,000, purchases ₦200,000, and closing stock ₦30,000, calculate cost of goods sold.",
                options: ["₦220,000", "₦250,000", "₦230,000", "₦180,000"],
                correct: 0
            },
            {
                question: "The double entry for cash sales is:",
                options: ["Debit Cash, Credit Sales", "Debit Sales, Credit Cash", "Debit Cash, Credit Capital", "Debit Purchases, Credit Cash"],
                correct: 0
            },
            {
                question: "A credit balance in the cash book represents:",
                options: ["Bank overdraft", "Cash in hand", "Bank balance", "Petty cash"],
                correct: 0
            },
            {
                question: "If sales is ₦500,000, cost of goods sold is ₦350,000, calculate gross profit.",
                options: ["₦150,000", "₦850,000", "₦200,000", "₦100,000"],
                correct: 0
            },
            {
                question: "The provision for doubtful debts is created to:",
                options: ["Cover possible losses from bad debts", "Increase profit", "Reduce expenses", "Increase debtors"],
                correct: 0
            },
            {
                question: "The accounting equation is expressed as:",
                options: ["Assets = Liabilities + Capital", "Assets = Capital - Liabilities", "Capital = Assets + Liabilities", "Liabilities = Assets + Capital"],
                correct: 0
            }
        ]
    };

// Additional subjects can be added here
// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = quizData;
      } 
