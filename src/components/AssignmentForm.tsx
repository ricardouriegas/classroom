import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getFullFileUrl } from '@/utils/fileHelpers';
import { FileText } from 'react-feather';

const AssignmentForm = ({ onSubmit, existingFiles }) => {
  const { register, handleSubmit, errors } = useForm();
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          ref={register({ required: true })}
        />
        {errors.title && <span>This field is required</span>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          ref={register}
        />
      </div>

      <div>
        <label htmlFor="files">Files</label>
        <input
          id="files"
          name="files"
          type="file"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {existingFiles && existingFiles.length > 0 && (
        <div>
          <h3>Existing Files</h3>
          {existingFiles.map((file) => (
            <a 
              key={file.id}
              href={getFullFileUrl(file.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 border rounded transition-colors"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm">{file.fileName}</span>
            </a>
          ))}
        </div>
      )}

      <button type="submit">Submit</button>
    </form>
  );
};

export default AssignmentForm;