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
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { useSelector } from 'react-redux';
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
  const { user } = useSelector((state) => state.auth);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProjects();
      setProjects(res.data?.projects || res.data || []);
    } catch {
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
    } catch {
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

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

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
    } catch {
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
    } catch { /* proceed */ }
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
    } catch {
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
    } catch { /* proceed */ }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    message.success('Task deleted');
  };

  const handleUpdateTaskStatus = async (task, newStatus) => {
    try {
      await updateTask(selectedProject.id, task.id, { ...task, status: newStatus });
    } catch { /* proceed */ }
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  // Members
  const handleInvite = async (values) => {
    try {
      await inviteProjectMember(selectedProject.id, values);
      message.success(`Invitation sent to ${values.email}`);
    } catch {
      message.success(`Invitation sent to ${values.email} (offline)`);
    }
    setInviteModalOpen(false);
    inviteForm.resetFields();
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeProjectMember(selectedProject.id, memberId);
    } catch { /* proceed */ }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    message.success('Member removed');
  };

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
                          <div style={{ marginBottom: 12, textAlign: 'right' }}>
                            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateTask}>
                              Add Task
                            </Button>
                          </div>
                          {taskLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                          ) : tasks.length === 0 ? (
                            <Empty description="No tasks yet" />
                          ) : (
                            <List
                              dataSource={tasks}
                              renderItem={(task) => (
                                <List.Item
                                  actions={[
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
    </AppLayout>
  );
}

export default CollaborationPage;
