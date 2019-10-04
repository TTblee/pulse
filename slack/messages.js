const { Response } = require('./response');

const getSlackUserString = (user) => `<@${user}>`;
const DIVIDER = {
    type: 'divider',
};
const createTextSection = ({ message, button = null }) => (
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: message,
        },
        // Either button is passed, or accessory undefined (null does not work)
        accessory: button ? {
            type: 'button',
            text: {
                type: 'plain_text',
                text: button.text,
            },
            action_id: button.actionId,
            value: button.value,
        } : undefined,
    }
);

class UserInputMessage {
    static GetSurveyAction() {
        throw new Error('has not implemented GetSurveyAction');
    }

    getId() {
        throw new Error('has not implemented GetId');
    }
}

class StartSurvey extends UserInputMessage {
    static GetSurveyAction() {
        return 'start_survey';
    }

    getId() {
        return Response.START_SURVEY;
    }

    constructor(userId) {
        super();
        this.userId = userId;
    }

    getEntryMessage() {
        return {
            blocks: [
                createTextSection({
                    message: `Hey ${getSlackUserString(this.userId)}! Thanks for taking the time to take this survey. :blush:\nThis survey is completely anonymous; team information is *ONLY* collected to scope survey participation distribution.\nYou cannot undo answers, so ensure the answer you choose is correct!`,
                }),
                DIVIDER,
            ],
        };
    }

    getMessage() {
        return {
            blocks: [

                createTextSection({
                    message: 'The survey only takes 10s - 20s to complete.',
                    button: {
                        text: 'Start survey',
                        actionId: 'start_survey',
                        value: 'start_survey',
                    },
                }),
            ],
        };
    }

    getSurveyAlreadyTakenMessage() {
        return 'You can only submit the survey once per entry basis. Please wait for the next occurrence.';
    }

    getSurveyAlreadyStartedMessage() {
        return 'You’ve already started a survey. Please complete that survey instance.';
    }
}

class WhatTeamQuestion extends UserInputMessage {
    static GetSurveyAction() {
        return 'what_team_survey';
    }

    getId() {
        return Response.WHAT_TEAM;
    }

    constructor() {
        super();
        this.options = [{
            text: 'Engineering',
            value: 'engineering',
        }, {
            text: 'Culinary',
            value: 'culinary',
        }, {
            text: 'Finance',
            value: 'finance',
        }, {
            text: 'Analytics',
            value: 'analytics',
        }, {
            text: 'Data Science',
            value: 'data-science',
        }, {
            text: 'Design',
            value: 'design',
        }, {
            text: 'Product',
            value: 'product',
        }, {
            text: 'Tell @blee your team’s not on here',
            value: 'not-on-list',
        }];
    }

    getMessage() {
        return {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'What team are you on?',
                    },
                    accessory: {
                        type: 'static_select',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Select an team',
                            emoji: true,
                        },
                        action_id: WhatTeamQuestion.GetSurveyAction(),
                        options: this.options.map(({ text, value }) => (
                            {
                                text: {
                                    type: 'plain_text',
                                    text,
                                    emoji: true,
                                },
                                value,
                            }
                        )),

                    },
                },
            ],
        };
    }
}

class MoodQuestion extends UserInputMessage {
    static GetSurveyAction() {
        return 'survey_mood';
    }

    getId() {
        return Response.MOOD;
    }

    constructor() {
        super();
        this.options = [{
            value: '1',
            text: '1 - Disgruntled :weary:',
        }, {
            value: '2',
            text: '2',
        }, {
            value: '3',
            text: '3 - Alright :slightly_smiling_face:',
        }, {
            value: '4',
            text: '4',
        }, {
            value: '5',
            text: '5 - Happy :blush:',
        }];
    }

    getMessage() {
        return {
            text: 'What is your mood?',
            attachments: [
                {
                    text: 'Choose a mood that most describes how you are feeling at this moment.',

                    callback_id: MoodQuestion.GetSurveyAction(),
                    color: '#3AA3E3',
                    attachment_type: 'default',
                    actions: this.options.map(({ value, text }) => ({
                        // Name is required, though is not being used for anything
                        name: 'mood',
                        text,
                        type: 'button',
                        value,
                    })),
                },
            ],
        };
    }
}

class Plus1Minus1Question extends UserInputMessage {
    constructor() {
        super();
        this.options = [
            {
                value: '-1',
                text: '-1 - :thumbsdown:',
            }, {
                value: '1',
                text: '+1 - :thumbsup:',
            },
        ];
    }
}

class CompanyQuestion extends Plus1Minus1Question {
    static GetSurveyAction() {
        return 'survey_company';
    }

    getId() {
        return Response.COMPANY;
    }

    getMessage() {
        return {
            text: 'How are things for you going on a *company-level*?',
            attachments: [
                {
                    text: 'Choose the answer that most describes how you are feeling at this moment.',

                    callback_id: CompanyQuestion.GetSurveyAction(),
                    color: '#3AA3E3',
                    attachment_type: 'default',
                    actions: this.options.map(({ value, text }) => ({
                        name: 'company',
                        text,
                        type: 'button',
                        value,
                    })),
                },
            ],
        };
    }
}

class TeamQuestion extends Plus1Minus1Question {
    static GetSurveyAction() {
        return 'survey_team';
    }

    getId() {
        return Response.TEAM;
    }

    getMessage() {
        return {
            text: 'How are things for you going on a *team-level*?',
            attachments: [
                {
                    text: 'Choose the answer that most describes how you are feeling at this moment.',

                    callback_id: TeamQuestion.GetSurveyAction(),
                    color: '#3AA3E3',
                    attachment_type: 'default',
                    actions: this.options.map(({ value, text }) => ({
                        name: 'team',
                        text,
                        type: 'button',
                        value,
                    })),
                },
            ],
        };
    }
}

class IndividualQuestion extends Plus1Minus1Question {
    static GetSurveyAction() {
        return 'survey_individual';
    }

    getId() {
        return Response.INDIVIDUAL;
    }

    getMessage() {
        return {
            text: 'How are things for you going on a *team-level*?',
            attachments: [
                {
                    text: 'Choose the answer that most describes how you are feeling at this moment.',

                    callback_id: IndividualQuestion.GetSurveyAction(),
                    color: '#3AA3E3',
                    attachment_type: 'default',
                    actions: this.options.map(({ value, text }) => ({
                        name: 'individual',
                        text,
                        type: 'button',
                        value,
                    })),
                },
            ],
        };
    }
}

module.exports = {
    StartSurvey, MoodQuestion, WhatTeamQuestion, CompanyQuestion, TeamQuestion, IndividualQuestion,
};
