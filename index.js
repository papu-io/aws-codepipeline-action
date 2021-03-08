var AWS = require("aws-sdk");
var core = require("@actions/core");

try {
  var awsRegion = core.getInput("aws-region");
  var awsAccessKey = core.getInput("aws-access-key");
  var awssecretKey = core.getInput("aws-secret-key");
  var pipelineName = core.getInput("pipeline-name");

  AWS.config = new AWS.Config();
  AWS.config.region = awsRegion;
  AWS.config.accessKeyId = awsAccessKey;
  AWS.config.secretAccessKey = awssecretKey;

  var codepipeline = new AWS.CodePipeline();
  var pipeline = {
    name: pipelineName,
  };

    codepipeline.startPipelineExecution(pipeline, function (err, response) {
        if (err) {
            console.log(err, err.stack);
        } else {
            setInterval(function () {
                let params = {
                    pipelineExecutionId: response.pipelineExecutionId,
                    pipelineName: pipelineName
                }
                codepipeline.getPipelineExecution(params, function (err, resp) {
                    let currentStatus = resp.pipelineExecution.status;

                    if (currentStatus === "InProgress") {
                        console.log("Waiting...")
                    } else if(currentStatus === "Succeeded") {
                        console.log("Finished!")
                        return true
                    } else {
                        core.setFailed(`Failed with status: ${currentStatus}`)
                        return false
                    }
                })

            }, 10000);
            console.log(response);
        }
    });
} catch (error) {
    core.setFailed(error.message);
}
