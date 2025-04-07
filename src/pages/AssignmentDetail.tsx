import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignmentDetail, getAssignmentSubmissions } from '@/api/assignments';
import { getFullFileUrl, formatFileSize } from '@/utils/fileHelpers';
import { FileText } from 'react-feather';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      const data = await getAssignmentDetail(assignmentId);
      setAssignment(data);
    };

    const fetchAssignmentSubmissions = async () => {
      const data = await getAssignmentSubmissions(assignmentId);
      setSubmissions(data);
    };

    fetchAssignmentDetail();
    fetchAssignmentSubmissions();
  }, [assignmentId]);

  if (!assignment) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
      <p className="mb-4">{assignment.description}</p>

      <h2 className="text-xl font-semibold mb-2">Attachments</h2>
      <div className="mb-4">
        {assignment.attachments.map(attachment => (
          <a 
            key={attachment.id}
            href={getFullFileUrl(attachment.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 border rounded transition-colors"
          >
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            <span className="text-sm">{attachment.fileName}</span>
            <span className="ml-auto text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</span>
          </a>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">Submissions</h2>
      <div>
        {submissions.map(submission => (
          <div key={submission.id} className="mb-4">
            <h3 className="text-lg font-semibold">{submission.studentName}</h3>
            <div>
              {submission.files.map(file => (
                <a 
                  key={file.id}
                  href={getFullFileUrl(file.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 border rounded transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">{file.fileName}</span>
                  <span className="ml-auto text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentDetail;