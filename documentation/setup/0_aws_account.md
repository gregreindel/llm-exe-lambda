
# Setting Up AWS Account

If you have never used CDK to deploy resources into your AWS account, you'll need to follow the instructions below.

## Create CDK Permission Boundary Policy
1. Navigate to IAM. Select policies, and click to create a new policy.
2. Paste in the contents from `documentation/setup/LlmExeLambdaCdkPermissionBoundaryPolicy.json` 
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `LlmExeLambdaCdkPermissionBoundaryPolicy`.


## Create CDK Deploy Policy & User
1. Navigate to IAM. Select policies, and click to create a new policy.
2. Paste in the contents from `documentation/setup/DeployLlmExeCdkAppPolicy.json` 
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `DeployLlmExeCdkAppPolicy`.
4. Create a new User. 
  - Name the user `LlmExeLambdaCdkDeployUser`
  - When asked to set permissions, select the `Attach policies directly` option, and then select the policy you just created. (can be helpful to sort the table by "Type", you'll notice the 'customer managed' policy.)
 - Add the new user
5. Click on the newly created user and click on the securirty credentials tab 
    - Click create access key 
    - Access key best practices & alternatives - select "Other"
    - Provide a description, such as "Key used to deploy CDK"
    - Copy the Access key and Secret access key, you'll need them next.


## Configure AWS CLI with the new permissions

On your computer, run `aws configure --profile llm-exe-lambda`
- it will ask for the access key you just created. `AWS Access Key ID [None]:`. Paste in your access key (startes with AKI). Hit enter.
- it will ask for the access key you just created. `AWS Secret Access Key [None]: `. Paste in your secret access key (the other one). Hit enter.
- it will ask for the default region. `Default region name [None]:` If you want to use a different region, use that, otherwise us-west-2.

## Confirm
Run the following command to make sure the CLI is configured properly.

`aws sts get-caller-identity --profile llm-exe-lambda`

You should see a response like:

```json
{
    "UserId": "YOUR_ACCESS_KEY_ID",
    "Account": "YOUR_ACCOUNT_ID",
    "Arn": "arn:aws:iam::YOUR_ACCOUNT_ID:user/LlmExeLambdaCdkDeployUser"
}
```