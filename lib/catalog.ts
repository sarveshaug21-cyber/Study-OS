export const EXAM_BOARD_CATALOG = [
  { board: "AQA", officialUrl: "https://www.aqa.org.uk", qualifications: ["GCSE","A-level"] },
  { board: "Pearson Edexcel", officialUrl: "https://qualifications.pearson.com", qualifications: ["GCSE","International GCSE","A-level","International A-level"] },
  { board: "OCR", officialUrl: "https://www.ocr.org.uk", qualifications: ["GCSE","A-level"] },
  { board: "WJEC", officialUrl: "https://www.wjec.co.uk", qualifications: ["GCSE","A-level"] },
  { board: "Eduqas", officialUrl: "https://www.eduqas.co.uk", qualifications: ["GCSE","A-level"] },
  { board: "CCEA", officialUrl: "https://www.rewardinglearning.org.uk", qualifications: ["GCSE","A-level"] },
] as const;
export const QUALIFICATIONS = ["GCSE","International GCSE","A-level","International A-level"] as const;
export const OFFICIAL_UPDATES_URLS = [
  { board:"AQA", label:"AQA subject updates", url:"https://www.aqa.org.uk/about-aqa/regulation" },
  { board:"Pearson Edexcel", label:"Pearson updates", url:"https://qualifications.pearson.com/news.html" },
  { board:"OCR", label:"OCR news", url:"https://www.ocr.org.uk/news/" },
  { board:"WJEC", label:"WJEC news", url:"https://www.wjec.co.uk/news.html" },
  { board:"Eduqas", label:"Eduqas news", url:"https://www.eduqas.co.uk/news.html" },
  { board:"CCEA", label:"CCEA news", url:"https://www.rewardinglearning.org.uk/news" },
];
