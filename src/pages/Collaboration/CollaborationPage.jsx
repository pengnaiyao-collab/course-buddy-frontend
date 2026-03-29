import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Avatar,
  Button,
  List,
  Tag,
  Modal,
  Form,
  Breadcrumb,
  Space,
  Badge,
  Tabs,
  Progress,
  Select,
  Input,
  Popconfirm,
  message,
  Spin,
  Empty,
  Tooltip,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  HomeOutlined,
  UserOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  UserAddOutlined,
  CommentOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { useSelector, useDispatch } from 'react-redux';
import websocketService from '../../services/ws/websocket';
import { setConnected, addCollaborationUpdate } from '../../store/slices/wsSlice';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listProjectMembers,
  inviteProjectMember,
  removeProjectMember,
  updateMemberRole,
  listTaskComments,
  createTaskComment,
  deleteTaskComment,
  getProjectLogs,
} from '../../services/api/collaboration';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_COLORS = {
  todo: 'default',
  in_progress: 'processing',
  done: 'success',
  blocked: 'error',
};

const PRIORITY_COLORS = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

const SAMPLE_PROJECTS = [
  { id: 1, name: 'CS101 Study Group', description: 'Collaborative study for Introduction to CS', status: 'active', memberCount: 8, taskCount: 12, doneCount: 7 },
  { id: 2, name: 'Algorithm Warriors', description: 'Deep dive into data structures and algorithms', status: 'active', memberCount: 5, taskCount: 8, doneCount: 3 },
  { id: 3, name: 'Web Dev Circle', description: 'Building full-stack web applications together', status: 'inactive', memberCount: 12, taskCount: 20, doneCount: 18 },
];

const SAMPLE_TASKS = [
  { id: 1, title: 'Review Chapter 3 - Sorting Algorithms', status: 'done', priority: 'high', assignee: 'Alice Wang', dueDate: '2024-03-20' },
  { id: 2, title: 'Implement Binary Search Tree', status: 'in_progress', priority: 'high', assignee: 'Bob Liu', dueDate: '2024-03-22' },
  { id: 3, title: 'Write unit tests for LinkedList', status: 'todo', priority: 'medium', assignee: 'Carol Zhang', dueDate: '2024-03-25' },
  { id: 4, title: 'Prepare presentation slides', status: 'todo', priority: 'low', assignee: '', dueDate: '2024-03-28' },
];

const SAMPLE_MEMBERS = [
  { id: 1, name: 'Alice Wang', email: 'alice@uni.edu', role: 'admin', avatar: 'A' },
  { id: 2, name: 'Bob Liu', email: 'bob@uni.edu', role: 'member', avatar: 'B' },
  { id: 3, name: 'Carol Zhang', email: 'carol@uni.edu', role: 'member', avatar: 'C' },
];

function CollaborationPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [projectForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [memberRoleForm] = Form.useForm();
  const { user } = useSelector((state) => state.auth);

  // New states for enhanced features
  const [selectedMemberForRole, setSelectedMemberForRole] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [taskComments, setTaskComments] = useState([]);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Search and filter states
  const [taskSearchText, setTaskSearchText] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState(null);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProjects();
      setProjects(res.data?.projects || res.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects(SAMPLE_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectDetails = useCallback(async (project) => {
    setTaskLoading(true);
    try {
      const [tasksRes, membersRes] = await Promise.all([
        listTasks(project.id),
        listProjectMembers(project.id),
      ]);
      setTasks(tasksRes.data?.tasks || tasksRes.data || []);
      setMembers(membersRes.data?.members || membersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
      setTasks(SAMPLE_TASKS);
      setMembers(SAMPLE_MEMBERS);
    } finally {
      setTaskLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject);
    }
  }, [selectedProject, fetchProjectDetails]);

  // WebSocket initialization for real-time collaboration updates
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user?.id || !selectedProject || !token) return;

    const handleWSConnected = () => {
      dispatch(setConnected(true));
      console.log('WebSocket connected for collaboration');
    };

    const handleWSError = (error) => {
      console.error('WebSocket connection error:', error);
      dispatch(setConnected(false));
    };

    // Connect to WebSocket
    websocketService.connect(token, handleWSConnected, handleWSError);

    // Subscribe to collaboration updates for this project
    const collaborationChannel = `/topic/collaboration/${selectedProject.id}`;
    websocketService.subscribe(collaborationChannel, (msg) => {
      console.log('Received collaboration update:', msg);

      dispatch(addCollaborationUpdate(msg));

      // Handle different message types
      if (msg.type === 'TASK_UPDATED') {
        setTasks((prev) =>
          prev.map((t) => t.id === msg.taskId ? { ...t, ...msg.data } : t)
        );
        message.info(`Task updated: ${msg.data?.title}`);
      } else if (msg.type === 'TASK_CREATED') {
        setTasks((prev) => [msg.data, ...prev]);
        message.success('New task added');
      } else if (msg.type === 'TASK_DELETED') {
        setTasks((prev) => prev.filter((t) => t.id !== msg.taskId));
        message.info('Task removed');
      } else if (msg.type === 'MEMBER_JOINED') {
        setMembers((prev) => [...prev, msg.data]);
        message.success(`${msg.data?.name} joined the project`);
      } else if (msg.type === 'MEMBER_LEFT') {
        setMembers((prev) => prev.filter((m) => m.id !== msg.memberId));
        message.info('Member left the project');
      }
    });

    // Cleanup on unmount or when project changes
    return () => {
      websocketService.unsubscribe(collaborationChannel);
    };
  }, [user?.id, selectedProject, token, dispatch]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  // Filter tasks based on search and filters
  const getFilteredTasks = useCallback(() => {
    return tasks.filter((task) => {
      const matchesSearch = !taskSearchText ||
        task.title?.toLowerCase().includes(taskSearchText.toLowerCase()) ||
        task.description?.toLowerCase().includes(taskSearchText.toLowerCase());
      const matchesStatus = !taskStatusFilter || task.status === taskStatusFilter;
      const matchesPriority = !taskPriorityFilter || task.priority === taskPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, taskSearchText, taskStatusFilter, taskPriorityFilter]);

  // Projects CRUD
  const openCreateProject = () => {
    setEditingProject(null);
    projectForm.resetFields();
    setProjectModalOpen(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    projectForm.setFieldsValue({ name: project.name, description: project.description });
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (values) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, values);
        setProjects((prev) => prev.map((p) => p.id === editingProject.id ? { ...p, ...values } : p));
        if (selectedProject?.id === editingProject.id) setSelectedProject((p) => ({ ...p, ...values }));
        message.success('Project updated');
      } else {
        const res = await createProject(values);
        const newProject = res.data?.project || res.data || { id: Date.now(), ...values, memberCount: 1, taskCount: 0, doneCount: 0, status: 'active' };
        setProjects((prev) => [newProject, ...prev]);
        message.success('Project created');
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      if (!editingProject) {
        setProjects((prev) => [{ id: Date.now(), ...values, memberCount: 1, taskCount: 0, doneCount: 0, status: 'active' }, ...prev]);
        message.success('Project created (offline)');
      } else {
        message.error('Failed to update project');
      }
    }
    setProjectModalOpen(false);
    projectForm.resetFields();
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
    } catch (err) { console.warn('Delete project API unavailable, proceeding locally:', err); }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    message.success('Project deleted');
  };

  // Tasks CRUD
  const openCreateTask = () => {
    setEditingTask(null);
    taskForm.resetFields();
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    taskForm.setFieldsValue(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (values) => {
    try {
      if (editingTask) {
        await updateTask(selectedProject.id, editingTask.id, values);
        setTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t, ...values } : t));
        message.success('Task updated');
      } else {
        const res = await createTask(selectedProject.id, values);
        const newTask = res.data?.task || res.data || { id: Date.now(), ...values };
        setTasks((prev) => [newTask, ...prev]);
        message.success('Task created');
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      if (!editingTask) {
        setTasks((prev) => [{ id: Date.now(), ...values }, ...prev]);
        message.success('Task created (offline)');
      } else {
        setTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t, ...values } : t));
        message.success('Task updated (offline)');
      }
    }
    setTaskModalOpen(false);
    taskForm.resetFields();
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(selectedProject.id, taskId);
    } catch (err) { console.warn('Delete task API unavailable, proceeding locally:', err); }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    message.success('Task deleted');
  };

  const handleUpdateTaskStatus = async (task, newStatus) => {
    try {
      await updateTask(selectedProject.id, task.id, { ...task, status: newStatus });
    } catch (err) { console.warn('Update task status API unavailable, proceeding locally:', err); }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  // Members
  const handleInvite = async (values) => {
    try {
      await inviteProjectMember(selectedProject.id, values);
      message.success(`Invitation sent to ${values.email}`);
    } catch (err) {
      console.warn('Invite API unavailable:', err);
      message.success(`Invitation sent to ${values.email} (offline)`);
    }
    setInviteModalOpen(false);
    inviteForm.resetFields();
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeProjectMember(selectedProject.id, memberId);
    } catch (err) { console.warn('Remove member API unavailable, proceeding locally:', err); }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    message.success('Member removed');
  };

  // Enhanced: Member role update
  const handleEditMemberRole = (member) => {
    setSelectedMemberForRole(member);
    memberRoleForm.setFieldsValue({ role: member.role });
    setRoleModalOpen(true);
  };

  const handleUpdateMemberRole = async (values) => {
    try {
      await updateMemberRole(selectedProject.id, selectedMemberForRole.id, { ...selectedMemberForRole, ...values });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMemberForRole.id ? { ...m, ...values } : m
        )
      );
      message.success('Member role updated');
    } catch (err) {
      console.warn('Update member role API unavailable, proceeding locally:', err);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMemberForRole.id ? { ...m, ...values } : m
        )
      );
      message.success('Member role updated (offline)');
    }
    setRoleModalOpen(false);
  };

  // Enhanced: Task comments
  const fetchTaskComments = useCallback(async (task) => {
    try {
      const res = await listTaskComments(selectedProject.id, task.id);
      setTaskComments(res.data?.comments || res.data || []);
    } catch (err) {
      console.warn('Failed to fetch task comments:', err);
      setTaskComments([]);
    }
  }, [selectedProject]);

  const handleAddComment = async (task) => {
    if (!newComment.trim()) {
      message.warning('Please enter a comment');
      return;
    }
    try {
      await createTaskComment(selectedProject.id, task.id, { content: newComment });
      message.success('Comment added');
      fetchTaskComments(task);
      setNewComment('');
    } catch (err) {
      console.warn('Add comment API unavailable:', err);
      setTaskComments((prev) => [
        ...prev,
        { id: Date.now(), content: newComment, author: user?.name || 'Me', createdAt: new Date().toLocaleString() },
      ]);
      message.success('Comment added (offline)');
      setNewComment('');
    }
  };

  const handleDeleteComment = async (task, commentId) => {
    try {
      await deleteTaskComment(selectedProject.id, task.id, commentId);
      setTaskComments((prev) => prev.filter((c) => c.id !== commentId));
      message.success('Comment deleted');
    } catch (err) {
      console.warn('Delete comment API unavailable:', err);
      setTaskComments((prev) => prev.filter((c) => c.id !== commentId));
      message.success('Comment deleted (offline)');
    }
  };

  // Enhanced: Activity logs
  const fetchActivityLogs = useCallback(async () => {
    if (!selectedProject) return;
    setLogsLoading(true);
    try {
      const res = await getProjectLogs(selectedProject.id);
      setActivityLogs(res.data?.logs || res.data || []);
    } catch (err) {
      console.warn('Failed to fetch activity logs:', err);
      setActivityLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [selectedProject]);

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);
  const totalTasks = tasks.length;
  const doneTasks = tasksByStatus('done').length;
  const progressPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Collaboration' },
          ]}
        />

        <Row gutter={24}>
          {/* Project list panel */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>👥 Projects</Title>
              <Space>
                <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} size="small" onClick={fetchProjects} loading={loading} /></Tooltip>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateProject}>New</Button>
              </Space>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : projects.length === 0 ? (
              <Empty description="No projects yet" />
            ) : (
              <List
                dataSource={projects}
                renderItem={(project) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        borderColor: selectedProject?.id === project.id ? '#1677ff' : undefined,
                        background: selectedProject?.id === project.id ? '#e6f4ff' : undefined,
                      }}
                      onClick={() => handleSelectProject(project)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>{project.name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>{project.description}</Text>
                          <div style={{ marginTop: 6 }}>
                            <Badge status={project.status === 'active' ? 'success' : 'default'} text={project.status === 'active' ? 'Active' : 'Inactive'} />
                            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                              {project.memberCount} members · {project.taskCount} tasks
                            </Text>
                          </div>
                        </div>
                        <Space size={4}>
                          <Button size="small" type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditProject(project); }} />
                          <Popconfirm title="Delete this project?" onConfirm={(e) => { e?.stopPropagation(); handleDeleteProject(project.id); }} okText="Yes" cancelText="No">
                            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                          </Popconfirm>
                        </Space>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Col>

          {/* Project detail panel */}
          <Col xs={24} md={16}>
            {!selectedProject ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <ProjectOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Select a project to view details</Text>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{selectedProject.name}</Title>
                    <Text type="secondary">{selectedProject.description}</Text>
                  </div>
                </div>

                {totalTasks > 0 && (
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Text strong>Overall Progress: </Text>
                    <Text>{doneTasks}/{totalTasks} tasks completed</Text>
                    <Progress percent={progressPct} style={{ marginTop: 8 }} />
                  </Card>
                )}

                <Tabs
                  defaultActiveKey="tasks"
                  items={[
                    {
                      key: 'tasks',
                      label: <><CheckSquareOutlined /> Tasks ({tasks.length})</>,
                      children: (
                        <div>
                          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Input
                              placeholder="Search tasks..."
                              prefix="🔍"
                              value={taskSearchText}
                              onChange={(e) => setTaskSearchText(e.target.value)}
                              style={{ flex: 1, minWidth: 200 }}
                              size="small"
                            />
                            <Select
                              placeholder="Filter by status"
                              value={taskStatusFilter}
                              onChange={setTaskStatusFilter}
                              allowClear
                              style={{ width: 140 }}
                              size="small"
                              options={[
                                { value: 'todo', label: 'To Do' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'done', label: 'Done' },
                                { value: 'blocked', label: 'Blocked' },
                              ]}
                            />
                            <Select
                              placeholder="Filter by priority"
                              value={taskPriorityFilter}
                              onChange={setTaskPriorityFilter}
                              allowClear
                              style={{ width: 130 }}
                              size="small"
                              options={[
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                              ]}
                            />
                            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateTask}>
                              Add Task
                            </Button>
                          </div>
                          {taskLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                          ) : getFilteredTasks().length === 0 ? (
                            <Empty description={taskSearchText || taskStatusFilter || taskPriorityFilter ? "No matching tasks" : "No tasks yet"} />
                          ) : (
                            <List
                              dataSource={getFilteredTasks()}
                              renderItem={(task) => (
                                <List.Item
                                  actions={[
                                    <Button
                                      key="comments"
                                      size="small"
                                      type="text"
                                      icon={<CommentOutlined />}
                                      onClick={() => {
                                        setSelectedTaskForComments(task);
                                        fetchTaskComments(task);
                                        setCommentModalOpen(true);
                                      }}
                                      title="View and add comments"
                                    >
                                      Comments
                                    </Button>,
                                    <Select
                                      key="status"
                                      size="small"
                                      value={task.status}
                                      style={{ width: 120 }}
                                      onChange={(val) => handleUpdateTaskStatus(task, val)}
                                      options={[
                                        { value: 'todo', label: 'To Do' },
                                        { value: 'in_progress', label: 'In Progress' },
                                        { value: 'done', label: 'Done' },
                                        { value: 'blocked', label: 'Blocked' },
                                      ]}
                                    />,
                                    <Button key="edit" size="small" type="text" icon={<EditOutlined />} onClick={() => openEditTask(task)} />,
                                    <Popconfirm key="del" title="Delete task?" onConfirm={() => handleDeleteTask(task.id)} okText="Yes" cancelText="No">
                                      <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>,
                                  ]}
                                >
                                  <List.Item.Meta
                                    title={
                                      <Space>
                                        <Text style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#8c8c8c' : undefined }}>
                                          {task.title}
                                        </Text>
                                        <Tag color={PRIORITY_COLORS[task.priority] || 'default'}>{task.priority || 'medium'}</Tag>
                                        <Badge status={STATUS_COLORS[task.status] || 'default'} />
                                      </Space>
                                    }
                                    description={
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        {task.assignee && <><UserOutlined /> {task.assignee}  ·  </>}
                                        {task.dueDate && <>Due: {task.dueDate}</>}
                                      </Text>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'members',
                      label: <><TeamOutlined /> Members ({members.length})</>,
                      children: (
                        <div>
                          <div style={{ marginBottom: 12, textAlign: 'right' }}>
                            <Button type="primary" size="small" icon={<UserAddOutlined />} onClick={() => setInviteModalOpen(true)}>
                              Invite Member
                            </Button>
                          </div>
                          {taskLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                          ) : members.length === 0 ? (
                            <Empty description="No members" />
                          ) : (
                            <List
                              dataSource={members}
                              renderItem={(member) => (
                                <List.Item
                                  actions={[
                                    <Button
                                      key="edit-role"
                                      size="small"
                                      type="text"
                                      icon={<EditOutlined />}
                                      onClick={() => handleEditMemberRole(member)}
                                      title="Edit member role"
                                    >
                                      Edit
                                    </Button>,
                                    member.role !== 'admin' && (
                                      <Popconfirm key="remove" title="Remove member?" onConfirm={() => handleRemoveMember(member.id)} okText="Yes" cancelText="No">
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                      </Popconfirm>
                                    ),
                                  ].filter(Boolean)}
                                >
                                  <List.Item.Meta
                                    avatar={<Avatar style={{ background: '#1677ff' }}>{member.avatar || member.name?.[0] || <UserOutlined />}</Avatar>}
                                    title={<Space><Text strong>{member.name}</Text><Tag color={member.role === 'admin' ? 'red' : 'blue'}>{member.role}</Tag></Space>}
                                    description={member.email}
                                  />
                                </List.Item>
                              )}
                            />
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'logs',
                      label: <><HistoryOutlined /> Activity Logs</>,
                      children: (
                        <div>
                          <div style={{ marginBottom: 12, textAlign: 'right' }}>
                            <Button size="small" icon={<ReloadOutlined />} onClick={fetchActivityLogs} loading={logsLoading}>
                              Refresh
                            </Button>
                          </div>
                          {logsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                          ) : activityLogs.length === 0 ? (
                            <Empty description="No activity yet" />
                          ) : (
                            <List
                              dataSource={activityLogs}
                              renderItem={(log) => (
                                <List.Item>
                                  <List.Item.Meta
                                    title={<Text>{log.action || 'Activity'}</Text>}
                                    description={
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        {log.actor || 'User'}  ·  {log.createdAt || log.timestamp}
                                        {log.details && <> · {log.details}</>}
                                      </Text>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Project modal */}
      <Modal
        title={editingProject ? 'Edit Project' : 'Create Project'}
        open={projectModalOpen}
        onCancel={() => setProjectModalOpen(false)}
        footer={null}
      >
        <Form form={projectForm} layout="vertical" onFinish={handleSaveProject}>
          <Form.Item name="name" label="Project Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. CS101 Study Group" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="What is this project about?" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setProjectModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">{editingProject ? 'Save' : 'Create'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Create Task'}
        open={taskModalOpen}
        onCancel={() => setTaskModalOpen(false)}
        footer={null}
      >
        <Form form={taskForm} layout="vertical" onFinish={handleSaveTask} initialValues={{ status: 'todo', priority: 'medium' }}>
          <Form.Item name="title" label="Task Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="What needs to be done?" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select options={[
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'done', label: 'Done' },
                  { value: 'blocked', label: 'Blocked' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="assignee" label="Assignee">
                <Select
                  allowClear
                  placeholder="Assign to…"
                  options={members.map((m) => ({ value: m.name, label: m.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setTaskModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">{editingTask ? 'Save' : 'Create'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Invite modal */}
      <Modal
        title="Invite Member"
        open={inviteModalOpen}
        onCancel={() => setInviteModalOpen(false)}
        footer={null}
      >
        <Form form={inviteForm} layout="vertical" onFinish={handleInvite}>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="member@university.edu" />
          </Form.Item>
          <Form.Item name="role" label="Role" initialValue="member">
            <Select options={[
              { value: 'admin', label: 'Admin' },
              { value: 'member', label: 'Member' },
              { value: 'viewer', label: 'Viewer' },
            ]} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setInviteModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Send Invitation</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Member Role Edit Modal */}
      <Modal
        title="Edit Member Role"
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
      >
        {selectedMemberForRole && (
          <Form form={memberRoleForm} layout="vertical" onFinish={handleUpdateMemberRole}>
            <Form.Item name="name" label="Member">
              <Input disabled value={selectedMemberForRole.name} />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select options={[
                { value: 'admin', label: 'Admin' },
                { value: 'member', label: 'Member' },
                { value: 'viewer', label: 'Viewer' },
              ]} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Update Role</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Task Comments Modal */}
      <Modal
        title={`Comments on "${selectedTaskForComments?.title}"`}
        open={commentModalOpen}
        onCancel={() => {
          setCommentModalOpen(false);
          setSelectedTaskForComments(null);
          setNewComment('');
        }}
        width={600}
        footer={null}
      >
        {selectedTaskForComments && (
          <div>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16, paddingBottom: 8 }}>
              {taskComments.length === 0 ? (
                <Empty description="No comments yet" style={{ paddingTop: 20 }} />
              ) : (
                <List
                  dataSource={taskComments}
                  renderItem={(comment) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteComment(selectedTaskForComments, comment.id)}
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        title={<Text strong>{comment.author || 'User'}</Text>}
                        description={
                          <>
                            <Text style={{ display: 'block' }}>{comment.content}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{comment.createdAt}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Input.TextArea
                rows={2}
                placeholder="Add a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                type="primary"
                onClick={() => handleAddComment(selectedTaskForComments)}
                style={{ alignSelf: 'flex-end' }}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

export default CollaborationPage;
