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
                    message: `Hey ${getSlackUserString(this.userId)}! Thanks for taking the time to take this survey. :blush:\n\nA few notes about this survey:\n• This survey is completely anonymous; team information is collected solely to scope participation distribution.\n• *You cannot undo answers*, so ensure the answer you choose is correct!`,
                }),
                DIVIDER,
            ],
        };
    }

    getMessage() {
        return {
            blocks: [

                createTextSection({
                    message: 'The survey only takes 15s - 20s to complete.',
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

    getSelectOptions() {
        const options = [{
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
            text: 'Legal',
            value: 'legal',
        }, {
            text: 'People',
            value: 'people',
        }]
        // Sort alphabetically by text
            .sort(({ text: valueA }, { text: valueB }) => {
                if (valueA < valueB) {
                    return -1;
                }
                return 1;
            });

        // Add option for missing teams
        options.push({
            text: 'Tell @blee your team’s not on here',
            value: 'not-on-list',
        });

        return options;
    }

    constructor() {
        super();
        this.options = this.getSelectOptions();
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
                    text: '_Choose a mood that most describes how you are feeling at this moment._',

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
                value: '1',
                text: '+1 - :thumbsup:',
            }, {
                value: '-1',
                text: '-1 - :thumbsdown:',
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
            text: 'How are things going for you on a *company-level*?',
            attachments: [
                {
                    text: '_Choose the answer that most describes how you are feeling at this moment._',

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
            text: 'How are things going for you on a *team-level*?',
            attachments: [
                {
                    text: '_Choose the answer that most describes how you are feeling at this moment._',

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
            text: 'How are things going for you on a *individual-level*?',
            attachments: [
                {
                    text: '_Choose the answer that most describes how you are feeling at this moment._',

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
