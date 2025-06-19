export default class AIPrompts {
  static generateLeaveRequestPrompt = `
         Create a leave request based on the following text: {text}. 
         If the text does not contain a valid leave request, throw an error asking for more information.
         If the text doesn't contains leave time duration or date, throw an error asking for the duration.
         Output start and end dates in ISO format (YYYY-MM-DD).
       `;

  static screenResumePrompt = `
  You are an HR assistant. Compare a resume with a job description and output structured screening results.

      Output this JSON:

      {{
        matchScore: number (0 to 100),
        confidence: number (0 to 100), 
        matchedSkills: string[],
        missingSkills: string[],
        recommendation: "shortlist" | "reject",
        reasoning: string
      }}

      where,
      - matchScore: Percentage match of the resume with the job description.
      - confidence: represents how sure you are about the accuracy of your score based on the clarity and completeness of the resume

      Evaluate based on required skills and experience in the job.

      Job Description: {job}
      Resume Content: {resume}
       `;
}
