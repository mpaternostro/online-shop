const fs = require("fs");
const ServerError = require("../error/server-error");

function deleteFile(filePath) {
  fs.access(filePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.unlink(filePath, (error) => {
        if (error) {
          throw new ServerError(error.message);
        }
      });
    }
  });
}

exports.deleteFile = deleteFile;
