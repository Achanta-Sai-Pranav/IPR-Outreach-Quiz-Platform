const XLSX = require("xlsx");
const fs = require("fs");
const Question = require("../models/Question.js");

exports.questionUpload = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized (admin) to upload the questions",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { path } = req.file;

    // Read the Excel file
    const workbook = XLSX.readFile(path);
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file has no sheets",
      });
    }

    let allFormattedData = [];
    let allDuplicates = [];

    // Process each sheet
    for (const sheetName of sheetNames) {
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (sheetData.length === 0) {
        console.log(`Sheet ${sheetName} is empty, skipping...`);
        continue;
      }

      // Validate required columns
      const requiredColumns = ['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'CorrectAns', 'Category'];
      const firstRow = sheetData[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required columns in sheet ${sheetName}: ${missingColumns.join(', ')}`,
        });
      }

      const formattedData = sheetData.map((row, index) => {
        // Validate each row
        if (!row.Question || !row.Option1 || !row.Option2 || !row.Option3 || !row.Option4 || !row.CorrectAns || !row.Category) {
          throw new Error(`Row ${index + 2} in sheet ${sheetName} is missing required fields`);
        }

        return {
          question: row.Question.toString().trim(),
          options: [
            row.Option1.toString().trim(),
            row.Option2.toString().trim(),
            row.Option3.toString().trim(),
            row.Option4.toString().trim(),
          ],
          correctAnswer: row.CorrectAns.toString().trim(),
          category: row.Category.toString().trim(),
          language: sheetName.toLowerCase(), // Get language from sheet name
          difficulty: (row.Difficulty || "medium").toString().trim(),
          createdBy: req.user.userId
        };
      });

      const existingQuestions = await Question.find();

      const duplicates = [];
      const uniqueData = formattedData.filter((data) => {
        const isDuplicate = existingQuestions.some(
          (q) =>
            q.question === data.question &&
            q.correctAnswer === data.correctAnswer &&
            q.category === data.category &&
            q.language === data.language
        );

        if (isDuplicate) {
          duplicates.push(data.question);
          return false;
        }
        return true;
      });

      allFormattedData = [...allFormattedData, ...uniqueData];
      allDuplicates = [...allDuplicates, ...duplicates];
    }

    if (allFormattedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All questions are duplicates. No new data to upload.",
        duplicates: allDuplicates,
      });
    }

    const insertedQuestions = await Question.insertMany(allFormattedData);

    res.status(200).json({
      success: true,
      message: "Excel data uploaded and stored successfully",
      insertedCount: insertedQuestions.length,
      duplicatesCount: allDuplicates.length,
      duplicates: allDuplicates,
    });
  } catch (error) {
    console.error("Error while uploading the excel file:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing Excel file",
    });
  } finally {
    // Clean up: Delete the uploaded file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error("Error deleting temporary file:", error);
      }
    }
  }
};

exports.findAllCategories = async (req, res) => {
  try {
    const categories = await Question.distinct("category");

    res.status(200).json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.log("Error while fetching categories: ", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Question.distinct("language");

    res.status(200).json({
      success: true,
      languages: languages,
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch languages",
      error: error.message,
    });
  }
};

exports.getCategoriesByDifficulty = async (req, res) => {
  try {
    // Get all unique difficulties
    const difficulties = await Question.distinct("difficulty");
    
    // Group categories by difficulty
    const categoriesByDifficulty = {};
    
    for (const difficulty of difficulties) {
      const categories = await Question.distinct("category", { difficulty: difficulty });
      categoriesByDifficulty[difficulty] = categories;
    }

    res.status(200).json({
      success: true,
      categoriesByDifficulty: categoriesByDifficulty,
    });
  } catch (error) {
    console.error("Error fetching categories by difficulty:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories by difficulty",
      error: error.message,
    });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const { selectedTags, totalQuestions } = req.body;

    if (
      !selectedTags ||
      !Array.isArray(selectedTags) ||
      selectedTags.length === 0
    ) {
      return res.status(400).json({ error: "Selected tags are required" });
    }

    try {
      const questionsPerTag = Math.floor(totalQuestions / selectedTags.length);
      let remainingQuestions = totalQuestions % selectedTags.length;

      let allQuestions = [];

      for (const tag of selectedTags) {
        const tagQuestions = await Question.find({ category: tag })
          .limit(questionsPerTag + (remainingQuestions > 0 ? 1 : 0))
          .sort({ createdAt: 1 });

        allQuestions = [...allQuestions, ...tagQuestions];

        if (remainingQuestions > 0) {
          remainingQuestions--;
        }
      }

      // Shuffle the questions
      allQuestions.sort(() => Math.random() - 0.5);

      res.json(allQuestions);
    } catch (error) {
      res.status(500).json({ error: "Error fetching random questions" });
    }
  } catch (error) {
    console.log("Error while fetching questions: ", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAllQuestions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized (admin) to delete all questions",
      });
    }

    await Question.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All questions have been deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting all questions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized (admin) to create questions",
      });
    }

    const {
      question,
      options,
      correctAnswer,
      category,
      language,
      difficulty = "medium"
    } = req.body;

    // Validate required fields
    if (!question || !options || !correctAnswer || !category || !language) {
      return res.status(400).json({
        success: false,
        message: "All fields are required except difficulty (defaults to medium)",
      });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Options must be an array with exactly 4 choices",
      });
    }

    // Validate correct answer is one of the options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be one of the provided options",
      });
    }

    const newQuestion = await Question.create({
      question,
      options,
      correctAnswer,
      category,
      language,
      difficulty,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
