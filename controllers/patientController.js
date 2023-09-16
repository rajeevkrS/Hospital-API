
const Report = require('../models/reports');
const Patient = require('../models/patient');


// Patient Registeration 
module.exports.register = async function(req,res)
{
    try {
        
        let user = await Patient.findOne({number:req.body.number});

        if(user){
            return res.status(200).json({
                message: 'Patient Already Registered',
                data: {
                    user:user
                }
            });
        }

        user = await Patient.create({
            number: req.body.number,
            name: req.body.name,
        });

        return res.status(201).json({
            message: 'Patient registered successfully',
            data: user
        });
    } 
    catch (error){
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

// Patient Report-Creation
module.exports.createReport = async function(req,res){
    try {
        
        const user = await Patient.findById(req.params.id)

        if(!user){
            return res.status(422).json({
                message: "Patient Does not exist"
            });
        }

        let report = await Report.create({
            createdByDoctor: req.user.id,
            patient: req.params.id,
            status: req.body.status,
            date: new Date()
        });

        user.reports.push(report);
        
        return res.status(201).json({
            message: 'Report created successfully',
            data: report
        })
        
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


// Showing Patient Reports
module.exports.patientReports = async function(req,res){
    try {
        const reports = await Report.find({patient:req.params.id}).populate('createdByDoctor').sort('date')

        const reportData = reports.map(report => {
            const originalDate = report.date;
            const dateObj = new Date(originalDate);

            const formattedDate = dateObj.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

            return {
              createdByDoctor: report.createdByDoctor.name,
              status: report.status,
              date: formattedDate
            };
          });

        return res.status(200).json({
            message: `List of Reports of Patient with id - ${req.params.id}`,
            reports:reportData    
        });
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}



