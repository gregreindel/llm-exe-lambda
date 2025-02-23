#!/bin/bash

StackName="LlmExeLambda"
IS_DEPLOY="no"
IS_SYNTH="no"
IS_BOOTSTRAP="no"
IS_UPDATE_SSM="no"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -synth)
            IS_SYNTH="yes"
            shift
        ;;
        -deploy)
            IS_DEPLOY="yes"
            shift
        ;;
        -bootstrap)
            IS_BOOTSTRAP="yes"
            IS_UPDATE_SSM="yes"
            shift
        ;;
        -update-secrets)
            IS_UPDATE_SSM="yes"
            shift
        ;;
        *) # unknown
            shift
        ;;
    esac
done

# check for .env and error if not there
if [ ! -f .env ]; then
    echo "Error: .env file not found.\n\nYou need to clone the .env.sample file and fill in the required values.\n\nCheck the docs for more information.\n\nhttps://github.com/gregreindel/llm-exe-lambda/actions?tab=readme-ov-file#2-clone-repo-and-setup"
    exit 1
fi

# check if `DEPLOY_REGION` env variable is set, error if not 
if [ -z "$DEPLOY_REGION" ]; then
    echo "Error: DEPLOY_REGION not set in .env file."
    exit 1
fi

# check if `DEPLOY_PROFILE` env variable is set, error if not 
if [ -z "$DEPLOY_PROFILE" ]; then
    echo "Error: DEPLOY_PROFILE not set in .env file."
    exit 1
fi


if [ $IS_UPDATE_SSM = "yes" ]; then
    # check is OPEN_AI_API_KEY is set, then create ssm secret
    if [ -n "$OPEN_AI_API_KEY" ]; then
        CREATE_SSM_SECRET_OPEN_AI=$(aws ssm put-parameter \
        --name "/$StackName/Secret/KeyOpenAI" \
        --value "$OPEN_AI_API_KEY" \
        --profile "$DEPLOY_PROFILE" \
        --type "SecureString" \
        --overwrite)
    fi

    # check is ANTHROPIC_API_KEY is set, then create ssm secret
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        CREATE_SSM_SECRET_ANTHROPIC=$(aws ssm put-parameter \
        --name "/$StackName/Secret/KeyAnthropic" \
        --value "$ANTHROPIC_API_KEY" \
        --profile "$DEPLOY_PROFILE" \
        --type "SecureString" \
        --overwrite)
    fi

    # check is XAI_API_KEY is set, then create ssm secret
    if [ -n "$XAI_API_KEY" ]; then
        CREATE_SSM_SECRET_XAI=$(aws ssm put-parameter \
        --name "/$StackName/Secret/KeyXAI" \
        --value "$XAI_API_KEY" \
        --profile "$DEPLOY_PROFILE" \
        --type "SecureString" \
        --overwrite)
    fi
    
fi

if [ $IS_BOOTSTRAP = "yes" ]; then
    # bootstrap stack
    npx cdk bootstrap -a "ts-node stack/index.ts"  \
    --profile "$DEPLOY_PROFILE" \
    --cloudformation-execution-policies "arn:aws:iam::$DEPLOY_ACCOUNT:policy/LlmExeLambdaCdkPermissionBoundaryPolicy"
fi

if [ $IS_SYNTH = "yes" ]; then
    npx cdk synth
fi

if [ $IS_DEPLOY = "yes" ]; then
    npx cdk deploy -a "ts-node stack/index.ts" "$StackName" \
    --profile "$DEPLOY_PROFILE"
fi