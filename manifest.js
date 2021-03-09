#!/usr/bin/env node

const assert = require('assert');

assert(process.env.DOCKER_IMAGE, 'DOCKER_IMAGE required');
assert(process.env.SERVICE_ACCOUNT, 'SERVICE_ACCOUNT required');
assert(process.env.SK_ARTIFACTS_BUCKET, 'SK_ARTIFACTS_BUCKET required');
assert(process.env.CF_PIPELINE_NAME, 'CF_PIPELINE_NAME required');
assert(process.env.CF_BUILD_ID, 'CF_BUILD_ID required');

console.log(JSON.stringify({
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
        name: `s3-cli-test-${process.env.CF_BUILD_ID}`
    },
    spec: {
        backoffLimit: 1,
        template: {
            spec: {
                automountServiceAccountToken: true,
                serviceAccountName: process.env.SERVICE_ACCOUNT,
                restartPolicy: "Never",
                initContainers: [{
                    name: "aws-access",
                    image: "amazonaws/cli",
                    command: [
                        "aws",
                        "sts",
                        "get-caller-identity"
                    ]
                }],
                containers: [{
                    name: "test",
                    image: process.env.DOCKER_IMAGE,
                    command: [
                      "yarn",
                      "run",
                      "cli",
                      "sync",
                      `s3://${process.env.SK_ARTIFACTS_BUCKET}/${process.env.CF_PIPELINE_NAME}/${process.env.CF_BUILD_ID}/`,
                      '.'
                    ]
                }]
            }
        }
    }
}));
