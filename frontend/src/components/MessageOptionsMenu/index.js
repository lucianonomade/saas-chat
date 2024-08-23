import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";

import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import ForwardModal from "../../components/ForwardMessageModal";

import toastError from "../../errors/toastError";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const editingContext = useContext(EditMessageContext);

	const setEditingMessage = editingContext ? editingContext.setEditingMessage : null;

	const {
		showSelectMessageCheckbox,
		setShowSelectMessageCheckbox,
		selectedMessages,
		forwardMessageModalOpen,
		setForwardMessageModalOpen } = useContext(ForwardMessageContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);


	const handleEditMessage = async () => {
		setEditingMessage(message);
		handleClose();
	}

	const handleSetShowSelectCheckbox = () => {
		setShowSelectMessageCheckbox(!showSelectMessageCheckbox);
		handleClose();
	};

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const hanldeReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	const isWithinFifteenMinutes = () => {
		const fifteenMinutesInMilliseconds = 15 * 60 * 1000; // 15 minutos em milissegundos
		const currentTime = new Date();
		const messageTime = new Date(message.updatedAt);

		// Verifica se a diferença entre o tempo atual e o tempo da mensagem é menor que 15 minutos
		return currentTime - messageTime <= fifteenMinutesInMilliseconds;
	};

	return (
		<>
			<ForwardModal
				modalOpen={forwardMessageModalOpen}
				messages={selectedMessages}
				onClose={(e) => {
					setForwardMessageModalOpen(false);
					setShowSelectMessageCheckbox(false);
				}}
			/>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				<MenuItem onClick={handleSetShowSelectCheckbox}>
					{i18n.t("messageOptionsMenu.forward")}
				</MenuItem>
				{message.fromMe && isWithinFifteenMinutes() && (
					<MenuItem key="edit" onClick={handleEditMessage}>
						{i18n.t("messageOptionsMenu.edit")}
					</MenuItem>
				)}
				{message.fromMe && (
					<MenuItem onClick={handleOpenConfirmationModal}>
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>
				)}
				<MenuItem onClick={hanldeReplyMessage}>
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
