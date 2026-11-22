import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import UploadPage from './UploadPage';

// Hoist mock mutate function
const mockMutate = vi.fn();

vi.mock('../../hooks', () => ({
  useJobs: () => ({
    data: [
      {
        job_id: 1,
        title: 'Senior Python Engineer',
        required_skills: ['Python', 'FastAPI'],
      },
      {
        job_id: 2,
        title: 'Product Designer',
        required_skills: ['Figma'],
      },
    ],
    isLoading: false,
  }),
  useUploadResumes: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('UploadPage Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialEntry = '/') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <UploadPage />
      </MemoryRouter>
    );

  it('renders upload page correctly with target job selected', () => {
    renderComponent();
    expect(screen.getByText('Upload Resumes')).toBeInTheDocument();
    expect(screen.getByText('Select Target Job Opening')).toBeInTheDocument();
    expect(
      screen.getByText(/Drag and drop candidate files here/i)
    ).toBeInTheDocument();
  });

  it('selects the job specified by the upload link', async () => {
    renderComponent('/studio/upload?jobId=2');

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('2');
    });
  });

  it('stages uploaded files and displays ready state', () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'alice_resume.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('Staged Files (1)')).toBeInTheDocument();
    expect(screen.getByText('alice_resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Ready to upload')).toBeInTheDocument();
    expect(screen.queryByText(/84\.5%/)).not.toBeInTheDocument();
  });

  it('handles ACCEPTED status as queued/processing and does NOT show fake score', async () => {
    mockMutate.mockImplementation((files, options) => {
      options.onSuccess([
        {
          filename: 'alice_resume.pdf',
          status: 'ACCEPTED',
          application_id: 101,
          candidate_id: 201,
          candidate_name: 'Alice Developer',
          file_hash: 'abc123hash',
          message: 'Resume uploaded successfully. Screening and matching queued in background.',
        },
      ]);
    });

    renderComponent();
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy pdf'], 'alice_resume.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Upload & Process/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Resume uploaded successfully\. Screening and matching queued in background\./i)
      ).toBeInTheDocument();
    });

    // Verify completely that 84.5% or fake scored status is NOT present
    expect(screen.queryByText(/84\.5%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/fit computed/i)).not.toBeInTheDocument();

    // Verify leaderboard button appears for accepted candidates
    expect(
      screen.getByRole('button', { name: /Open updated leaderboard/i })
    ).toBeInTheDocument();
  });

  it('handles DUPLICATE status properly', async () => {
    mockMutate.mockImplementation((files, options) => {
      options.onSuccess([
        {
          filename: 'bob_resume.pdf',
          status: 'DUPLICATE',
          application_id: 55,
          candidate_id: 88,
          candidate_name: 'Bob Smith',
          file_hash: 'hashduplicate',
          message: 'Exact duplicate resume detected for this job. Skipped processing.',
        },
      ]);
    });

    renderComponent();
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy duplicate'], 'bob_resume.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Upload & Process/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Exact duplicate resume detected for this job/i)
      ).toBeInTheDocument();
    });
  });

  it('handles REJECTED status with backend reason', async () => {
    mockMutate.mockImplementation((files, options) => {
      options.onSuccess([
        {
          filename: 'corrupt.pdf',
          status: 'REJECTED',
          message: 'Unsupported file format. Only PDF and DOCX files are supported.',
        },
      ]);
    });

    renderComponent();
    const input = document.querySelector('input[type="file"]');
    const file = new File(['corrupt data'], 'corrupt.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Upload & Process/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Unsupported file format\. Only PDF and DOCX files are supported\./i)
      ).toBeInTheDocument();
    });
  });

  it('handles ERROR status with error message', async () => {
    mockMutate.mockImplementation((files, options) => {
      options.onSuccess([
        {
          filename: 'error_file.pdf',
          status: 'ERROR',
          message: 'Upload failed: Disk full or write permission denied.',
        },
      ]);
    });

    renderComponent();
    const input = document.querySelector('input[type="file"]');
    const file = new File(['error data'], 'error_file.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Upload & Process/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Upload failed: Disk full or write permission denied\./i)
      ).toBeInTheDocument();
    });
  });

  it('supports partial upload success across multiple files', async () => {
    mockMutate.mockImplementation((files, options) => {
      options.onSuccess([
        {
          filename: 'valid.pdf',
          status: 'ACCEPTED',
          application_id: 1,
          candidate_id: 10,
          candidate_name: 'Valid Candidate',
          message: 'Resume uploaded successfully. Screening and matching queued in background.',
        },
        {
          filename: 'dup.pdf',
          status: 'DUPLICATE',
          message: 'Exact duplicate resume detected for this job. Skipped processing.',
        },
        {
          filename: 'rejected.pdf',
          status: 'REJECTED',
          message: 'File exceeds maximum allowed size (15MB).',
        },
      ]);
    });

    renderComponent();
    const input = document.querySelector('input[type="file"]');
    const f1 = new File(['1'], 'valid.pdf', { type: 'application/pdf' });
    const f2 = new File(['2'], 'dup.pdf', { type: 'application/pdf' });
    const f3 = new File(['3'], 'rejected.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [f1, f2, f3] } });

    expect(screen.getByText('Staged Files (3)')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Upload & Process/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Resume uploaded successfully\. Screening and matching queued in background\./i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Exact duplicate resume detected for this job\. Skipped processing\./i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/File exceeds maximum allowed size \(15MB\)\./i)
      ).toBeInTheDocument();
    });

    // Check that no fake score exists
    expect(screen.queryByText(/84\.5%/)).not.toBeInTheDocument();
  });
});
