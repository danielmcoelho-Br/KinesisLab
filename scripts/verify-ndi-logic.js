const { calculateAssessmentScore } = require('../src/lib/calculations');

console.log("Testing NDI Calculation Logic...");

// Test 1: All 10 questions answered with 0
const test1 = calculateAssessmentScore('ndi', {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0});
console.log("Test 1 (All 0s):", test1.percentage === 0 ? "PASSED" : "FAILED", `(${test1.percentage}%)`);

// Test 2: Only 1 question answered with 5, rest skipped
const test2 = calculateAssessmentScore('ndi', {0:5});
console.log("Test 2 (1 Answered, Value 5):", test2.percentage === 100 ? "PASSED" : "FAILED", `(${test2.percentage}%)`);

// Test 3: 5 questions answered with 2, 5 skipped
const test3 = calculateAssessmentScore('ndi', {0:2, 1:2, 2:2, 3:2, 4:2});
console.log("Test 3 (5 Answered, Value 2):", test3.percentage === 40 ? "PASSED" : "FAILED", `(${test3.percentage}%)`);

// Test 4: Cutoffs
const test4 = calculateAssessmentScore('ndi', {0:1}); // (1/5)*100 = 20%
console.log("Test 4 (Cutoff 20%):", test4.interpretation === 'Deficiência Leve' ? "PASSED" : "FAILED", `(${test4.interpretation})`);
