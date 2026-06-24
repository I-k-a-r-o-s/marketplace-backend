export const errorResponse = (res, functionName, error) => {
  console.log(`Error in ${functionName}!: ${error.message}`);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error!",
  });
};
