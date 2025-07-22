// components/sprint/tabs/UploadsTab.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  Upload,
  Download,
  ExternalLink,
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  File,
  Calendar,
  User,
  Filter,
  AlertCircle,
  X,
  Trash2,
  Loader2,
} from 'lucide-react';
import { UploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { toast } from 'sonner';

// ✅ Import canonical types used across SprintHub instead of redefining local stubs
import type { SprintLandingData } from '@/utils/sprintHub/types';

interface UnifiedUploadData {
  id: string;
  filename: string;
  name: string;
  fileType: string;
  type: 'IMAGE' | 'PDF' | 'VIDEO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER';
  fileSize: number;
  url: string;
  uploadedAt: string;
  createdAt: string;
  taskTitle: string;
  task: {
    id: string;
    title: string;
    assignedTo?: {
      id: string;
      name: string;
      email: string;
    };
  };
  uploaderName: string;
}

interface UploadsTabProps {
  data?: SprintLandingData | null;
  workspaceId: string;
}

export function UploadsTab({ data, workspaceId }: UploadsTabProps) {
  const [uploads, setUploads] = useState<UnifiedUploadData[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<UnifiedUploadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Determine projectId (SprintLandingData.project is nullable)
  const projectId = useMemo(() => {
    return data?.project?.id ?? null;
  }, [data]);

  // Basic prop validation (debug only)
  const validationErrors: string[] = [];
  if (!workspaceId) validationErrors.push('workspaceId missing');
  if (!projectId) validationErrors.push('projectId missing (no project on data or team)');

  // ---- Normalization helpers ------------------------------------------------
  const normalizeFileType = (fileType: string): UnifiedUploadData['type'] => {
    const type = (fileType ?? '').toLowerCase();
    if (type.includes('image') || /\.(png|jpe?g|gif|svg)$/i.test(type)) return 'IMAGE';
    if (type.includes('video') || /\.(mp4|avi|mov|webm)$/i.test(type)) return 'VIDEO';
    if (type.includes('pdf')) return 'PDF';
    if (/(docx?|txt|rtf|md)$/i.test(type)) return 'DOCUMENT';
    if (/(zip|rar|tar|gz)$/i.test(type)) return 'ARCHIVE';
    return 'OTHER';
  };

  const normalizeUploadData = (rawUploads: any[]): UnifiedUploadData[] => {
    return rawUploads.map((upload) => {
      const fileType = upload.fileType ?? upload.type ?? upload.mimeType ?? 'unknown';
      const filename = upload.filename ?? upload.name ?? 'Unknown File';
      const dt = upload.uploadedAt ?? upload.createdAt ?? new Date().toISOString();
      const taskTitle = upload.taskTitle ?? upload.task?.title ?? 'Unknown Task';
      const uploaderName =
        upload.uploaderName ??
        upload.task?.assignedTo?.name ??
        upload.uploader?.name ??
        'Unknown User';

      return {
        id: String(upload.id ?? crypto.randomUUID()),
        filename,
        name: filename,
        fileType,
        type: normalizeFileType(fileType),
        fileSize: Number(upload.fileSize ?? 0),
        url: upload.url ?? '',
        uploadedAt: dt,
        createdAt: dt,
        taskTitle,
        task: {
          id: String(upload.taskId ?? upload.task?.id ?? ''),
          title: taskTitle,
          assignedTo: upload.assignedTo ?? upload.task?.assignedTo,
        },
        uploaderName,
      };
    });
  };

  const fetchUploads = async (pId: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/sprint/uploads?projectId=${pId}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API Error ${res.status}: ${txt}`);
      }
      const data = await res.json();
      const rawData = Array.isArray(data)
        ? data
        : Array.isArray(data.files)
          ? data.files
          : Array.isArray(data.formattedFiles)
            ? data.formattedFiles
            : [];
      if (!Array.isArray(rawData)) {
        throw new Error('API response not array');
      }
      const normalized = normalizeUploadData(rawData);
      setUploads(normalized);
    } catch (err) {
      console.error('Uploads fetch failed', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch uploads');
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    if (validationErrors.length) {
      setError(`Configuration Error: ${validationErrors.join(', ')}`);
      setLoading(false);
      return;
    }
    if (projectId) {
      fetchUploads(projectId);
    }
  }, [projectId, workspaceId]);

  // filter when inputs change
  useEffect(() => {
    let filtered = uploads;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.filename.toLowerCase().includes(q) ||
          u.taskTitle.toLowerCase().includes(q) ||
          u.uploaderName.toLowerCase().includes(q),
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((u) => getFileCategory(u.fileType) === filterType);
    }

    setFilteredUploads(filtered);
  }, [uploads, searchTerm, filterType]);

  // ----- UI helpers ----------------------------------------------------------
  const getFileCategory = (fileType: string) => {
    const type = (fileType ?? '').toLowerCase();
    if (type.includes('image') || /\.(png|jpe?g|gif|svg)$/i.test(type)) return 'image';
    if (type.includes('video') || /\.(mp4|avi|mov|webm)$/i.test(type)) return 'video';
    if (type.includes('pdf')) return 'pdf';
    return 'other';
  };

  const getFileIcon = (fileType: string) => {
    const category = getFileCategory(fileType);
    switch (category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-green-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    const category = getFileCategory(fileType);
    switch (category) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'pdf':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateLike: string | Date) => {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async (uploadId: string, filename: string) => {
    try {
      const response = await fetch(`/api/sprint/uploads/${uploadId}/download`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download', err);
      setError('Failed to download file');
    }
  };

  const handleView = (upload: UnifiedUploadData) => {
    if (upload.url) {
      window.open(upload.url, '_blank');
    } else {
      window.open(`/api/sprint/uploads/${upload.id}/view`, '_blank');
    }
  };

  // Handle delete functionality
  const handleDelete = async (uploadId: string) => {
    setDeletingFile(uploadId);
    try {
      const response = await fetch(`/api/sprint/uploads/${uploadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }

      // Remove file from local state
      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setDeletingFile(null);
      setShowDeleteConfirm(null);
    }
  };

  const confirmDelete = (upload: UnifiedUploadData) => {
    setShowDeleteConfirm(upload.id);
  };

  // Handle upload completion
  const handleUploadComplete = (res: any[]) => {
    toast.success(`Successfully uploaded ${res.length} file(s)`);
    setShowUploadModal(false);
    // Refresh uploads after successful upload
    if (projectId) {
      fetchUploads(projectId);
    }
  };

  const handleUploadError = (error: Error) => {
    toast.error(`Upload failed: ${error.message}`);
  };

  // ----- Render --------------------------------------------------------------
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center space-x-3 p-6">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
            {projectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUploads(projectId)}
                className="mt-2"
              >
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete File</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-medium">
                  {uploads.find(u => u.id === showDeleteConfirm)?.filename}
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingFile === showDeleteConfirm}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingFile === showDeleteConfirm}
              >
                {deletingFile === showDeleteConfirm ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Uploads</h2>
          <p className="text-gray-600">
            {filteredUploads.length} file{filteredUploads.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Upload Modal - keeping the same as before */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Files</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Image Uploads */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-green-500" />
                  Images (PNG, JPG, GIF, SVG)
                </h4>
                <UploadDropzone<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  config={{
                    mode: "auto"
                  }}
                  appearance={{
                    container: "border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50",
                    uploadIcon: "text-green-500",
                    label: "text-sm text-green-700 font-medium",
                    allowedContent: "text-xs text-green-600"
                  }}
                />
              </div>

              {/* PDF Uploads */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  PDF Documents
                </h4>
                <UploadDropzone<OurFileRouter, "documentUploader">
                  endpoint="documentUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  config={{
                    mode: "auto"
                  }}
                  appearance={{
                    container: "border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50",
                    uploadIcon: "text-blue-500",
                    label: "text-sm text-blue-700 font-medium",
                    allowedContent: "text-xs text-blue-600"
                  }}
                />
              </div>

              {/* Video Uploads */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-500" />
                  Videos (MP4, AVI, MOV, WEBM)
                </h4>
                <UploadDropzone<OurFileRouter, "videoUploader">
                  endpoint="videoUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  config={{
                    mode: "auto"
                  }}
                  appearance={{
                    container: "border-2 border-dashed border-red-300 rounded-lg p-6 bg-red-50",
                    uploadIcon: "text-red-500",
                    label: "text-sm text-red-700 font-medium",
                    allowedContent: "text-xs text-red-600"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats - Only 3 categories now */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {uploads.filter((u) => u.type === 'IMAGE').length}
            </div>
            <div className="text-sm text-gray-600">Images</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {uploads.filter((u) => u.type === 'PDF').length}
            </div>
            <div className="text-sm text-gray-600">PDFs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {uploads.filter((u) => u.type === 'VIDEO').length}
            </div>
            <div className="text-sm text-gray-600">Videos</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files by name, task, or uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Uploads Grid */}
      {filteredUploads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
            <p className="text-gray-600 text-center">
              {searchTerm || filterType !== 'all'
                ? 'No files match your search criteria.'
                : 'Upload images, PDFs, or videos to get started with your project.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUploads.map((upload) => (
            <Card key={upload.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    {getFileIcon(upload.fileType)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{upload.filename}</h3>
                        <Badge className={getFileTypeColor(upload.fileType)}>{upload.fileType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">Task: {upload.taskTitle}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{upload.uploaderName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(upload.uploadedAt)}</span>
                        </div>
                        {upload.fileSize > 0 && <span>{formatFileSize(upload.fileSize)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleView(upload)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(upload.id, upload.filename)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(upload)}
                      disabled={deletingFile === upload.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingFile === upload.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
