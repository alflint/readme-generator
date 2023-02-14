const inquirer = require('inquirer');
const fs = require('fs');

const h1 = "#"
const h2 = "##"

const licenses = {
    "MIT": "https://opensource.org/licenses/MIT",
    "GNU General Public License (GPL)": "https://www.gnu.org/licenses/gpl-3.0.en.html",
    "Apache License 2.0": "https://www.gnu.org/licenses/gpl-3.0.en.html",
    "BSD 3-Clause License": "https://opensource.org/licenses/BSD-3-Clause",
    "Creative Commons 4.0": "https://creativecommons.org/licenses/by/4.0/legalcode",
}

// Function to ensure that user has inputted a valid text length
const validateShort = async (input) => {
    if (input.length < 3){
        return "Please respond with three or more characters"
    } return true
}

// Function to ensure that user has inputted a valid text length
const validateLong = async (input) => {
    if (input.length < 10){
        return "Please respond with ten or more characters"
    } return true
}

// Function to ensure that user has inputted a valid email address
const validateEmail = async (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)){
        return "Please enter a valid email address."
    } return true
}

inquirer
    .prompt([
        {
            name: 'projectName',
            message: 'What is the name of your project?',
            validate: validateShort
        },
        {
            name: "description",
            message :"Please provide a description of your project?",
            validate: validateLong
        },
        {
            type: 'confirm',
            name: 'hasLicense',
            message: 'Does your project have a license',
        },
        {
            type: 'list',
            name: 'license',
            message: 'Please select your license type:',
            choices: ["MIT", "GNU General Public License (GPL)", "Apache License 2.0", "BSD 3-Clause License", "Creative Commons 4.0", "Other"],
            when: (answers) => answers.hasLicense == true
        },
        {
            type: 'input',
            name: 'otherLicense',
            message: 'Please specify your license:',
            when: (answers) => answers.license == "Other",
            validate: validateShort
        },
        {
            type: 'input',
            name: 'otherLicenseLink',
            message: 'Please specify the link to your license:',
            when: (answers) => answers.license == "Other",
            validate: validateShort
        },
        {
            type: 'checkbox',
            name: 'tableOfContents',
            message: 'Select the following sections you want to include in your README:',
            choices: [
                'Installation', 'Usage', 'Contributing', 'Tests', 'Questions',
            ],
        },
        {
            type: 'input',
            name: 'Installation',
            message: 'Please describe how to install your project:',
            when: (answers) => answers.tableOfContents.includes("Installation"),
            validate: validateLong
        },
        {
            type: 'input',
            name: 'Usage',
            message: 'Please describe how your project is to be used:',
            when: (answers) => answers.tableOfContents.includes("Usage"),
            validate: validateLong
        },
        {
            type: 'input',
            name: 'Contributing',
            message: 'Please define how you would like others to contribute to your project:',
            when: (answers) => answers.tableOfContents.includes("Contributing"),
            validate: validateLong
        },
        {
            type: 'input',
            name: 'Tests',
            message: 'Please specify how this project can be tested:',
            when: (answers) => answers.tableOfContents.includes("Tests"),
            validate: validateLong
        },
        {
            type: 'input',
            name: 'username',
            message: 'Please enter your github username:',
            when: (answers) => answers.tableOfContents.includes("Questions"),
            validate: validateShort
        },
        {
            type: 'input',
            name: 'email',
            message: 'Please enter your email address:',
            when: (answers) => answers.tableOfContents.includes("Questions"),
            validate: validateEmail
        },
    ])
    .then(answers => {
        lines = []

        // Title
        lines.push(`${h1} ${answers.projectName}`)

        // License badge at top of README
        if(answers.hasLicense == true){
            if(answers.license != "Other"){
                lines.push(`![License](https://img.shields.io/badge/License-${answers.license.replace(/ /g, "%20").replace(/-/g, "--")}-lightgrey)`)
            } else {
                lines.push(`![License](https://img.shields.io/badge/License-${answers.otherLicense.replace(/ /g, "%20").replace(/-/g, "--")}-lightgrey)`)
            }
        }

        // Description
        lines.push(`${h2} Description`)
        lines.push(`${answers.description}`)
        lines.push(`<br>`)

        // Table of Contents and selected fields (if any) or license (if selected)
        if(answers.tableOfContents != undefined || answers.hasLicense == true){

            // Table of Contents
            lines.push(`<hr>`)
            lines.push(`${h2} Table of Contents`)
            if(answers.tableOfContents !== undefined){
                answers.tableOfContents.forEach( e =>{
                    lines.push(`[${e}](#${e})`)
                })
            }
            // License (Table of contents)
            if(answers.hasLicense == true){
                lines.push(`[License](#License)`)
            }
            lines.push(`<hr>`)

            // Any fields that were selected
            if(answers.tableOfContents !== undefined){
                answers.tableOfContents.forEach( e => {
                    lines.push(`<br>`)
                    lines.push(`${h2} ${e}`)
                    if(e == "Questions"){
                        lines.push(`If you have any questions feel free to [email me](mailto:${answers.email}) or reach out on [Github](https://github.com/${answers.username})`)
                    } else {
                        lines.push(`${answers[e]}`)
                    }
                })
            }

            // License Section
            if(answers.hasLicense == true){
                lines.push(`<br>`)
                lines.push(`${h2} License`)
                if(answers.license != "Other"){
                    lines.push(`This project is covered under [${answers.license}](${licenses[answers.license]}).`)
                } else {
                    lines.push(`This project is covered under [${answers.otherLicense}](${answers.otherLicenseLink}).`)
                }
            }
        }
        
        // Join the list of lines into a string separated by two new lines each and write to GENERATED_README.md
        content = lines.join("\r\n\n");
        fs.writeFile('GENERATED_README.md', content, err => {
            if (err) {
              console.error(err);
            }
        });
        console.log("./GENERATED_README.md created successfully!");
    });