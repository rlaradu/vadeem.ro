export interface DailyQuestion {
  id: string;
  publish_date: string;
  /** Slot within the day (1..3). */
  position: number;
  question_text: string;
  correct_answer: number;
  explanation_text: string;
  source_link: string | null;
  /** Unit shown at the end of the input, e.g. "KILOGRAME". */
  unit: string | null;
  /** Public URL of the question picture; null = generated artwork is used. */
  image_url: string | null;
}
