import React, { useEffect, useState } from 'react';
import { LuPlus } from "react-icons/lu";
import { CARD_BG } from '../../utils/data';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { SummaryCard } from '../../components/Cards/SummaryCard';
import moment from 'moment';
import Modal from '../../components/Modal';
import { CreateSessionForm } from './CreateSessionForm';
import { DeleteAlertContent } from '../../components/Loaders/DeleteAlertContent';

const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [session, setSession] = useState([]);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  // Fetch all sessions
  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSession(response.data);
    } catch (error) {
      console.error("Error while fetching all sessions", error);
      toast.error("Error while fetching all sessions");
    }
  };

  // Delete session
  const deleteSession = async (sessionData) => {
    if (!sessionData?._id) {
      toast.error("Invalid session selected");
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData._id));
      toast.success("Session deleted successfully");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session data", error);
      toast.error(error.response?.data?.message || "Error deleting session");
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
      <div className='container mx-auto pt-4 pb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0'>
          {session?.map((data, index) => (
            <SummaryCard
              key={data?._id}
              colors={CARD_BG[index % CARD_BG.length]}
              role={data?.role || ""}
              topicsToFocus={data?.topicsToFocus || ""}
              experience={data?.experience || "--"}
              questions={data?.questions?.length || "--"}
              description={data?.description || ""}
              lastUpdated={
                data?.updatedAt
                  ? moment(data.updatedAt).format("Do MMM YYYY")
                  : ""
              }
              onSelect={() => navigate(`/interview-prep/${data?._id}`)}
              onDelete={() =>
                setOpenDeleteAlert({
                  open: true,
                  data: data,
                })
              }
            />
          ))}
        </div>

        {/* Add New Session Button */}
        <button
          className='h-12 md:h-12 flex items-center justify-center gap-3 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed bottom-10 md:bottom-20 right-10 md:right-20'
          onClick={() => setOpenCreateModel(true)}
        >
          <LuPlus className='text-2xl text-white' />
          Add New
        </button>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={openCreateModel}
        onClose={() => setOpenCreateModel(false)}
        hideHeader
      >
        <CreateSessionForm />
      </Modal>

      {/* Delete Session Modal */}
      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Alert"
      >
        <div className='w-[30vw]'>
          <DeleteAlertContent
            content="Are you sure want to delete this session detail?"
            onDelete={() => deleteSession(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
