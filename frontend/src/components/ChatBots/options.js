import React, { useContext } from "react";
import * as Yup from "yup";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import api from "../../services/api";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/Edit";
import { IconButton, InputLabel, MenuItem, Select } from "@material-ui/core";
import { Formik, Field, FieldArray } from "formik";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import SaveIcon from "@material-ui/icons/Save";
import TextField from "@material-ui/core/TextField";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import CustomToolTip from "../ToolTips";
import ConfirmationModal from "../ConfirmationModal";
import { i18n } from "../../translate/i18n";
import Switch from "@material-ui/core/Switch";
import { FormControlLabel } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";

const QueueSchema = Yup.object().shape({
  options: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().min(4, "too short").required("Required"),
      })
    )
    .required("Must have friends"),
});

const useStyles = makeStyles((theme) => ({
  greetingMessage: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  Box: {
    cursor: "pointer",
    alignItems: "center",
  },
  textField1: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
}));

function getStepContent(step) {
  return <VerticalLinearStepper chatBotId={step} />;
}

export default function VerticalLinearStepper(props) {
  const initialState = {
    name: "",
    greetingMessage: "",
    options: [],
    closeTicket: false
  };

  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(-1);
  const [steps, setSteps] = React.useState(initialState);
  const [loading, setLoading] = React.useState(false);
  const [isStepContent, setIsStepContent] = React.useState(true);
  const [isNameEdit, setIsNamedEdit] = React.useState(null);
  const [isGreetingMessageEdit, setGreetingMessageEdit] = React.useState(null);
  const [selectedQueue, setSelectedQueue] = React.useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const [queues, setQueues] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [integrations, setIntegrations] = React.useState([]);
  const [file, setFile] = React.useState([]);
  const { user } = useContext(AuthContext);

  const companyId = user.companyId;

  const handleSaveBot = async (values) => {
    try {
      if (props.chatBotId) {
        await api.put(`/chatbot/${props.chatBotId}`, values);
      } else {
        await api.post("/chatbot", values);
      }
      toast.success("Bot saved successfully");
      // setActiveStep(-1)
      const { data } = await api.get(`/chatbot/${props.chatBotId}`);

      setSteps(initialState);
      setSteps(data);
      setIsNamedEdit(null);
      setGreetingMessageEdit(null);

      setSteps(data);
    } catch (err) {
      toastError(err);
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue", {
          params: { companyId }
        });

        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId }
        });

        setFile(data.files);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/", {
          params: { companyId }
        });

        setUsers(data.users);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queueIntegration", {
          params: { companyId }
        });

        setIntegrations(data.integrations);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  React.useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchList = async () => {
        try {
          const { data } = await api.get(`/chatbot/${props.chatBotId}`);
          setSteps(data);
          setLoading(false);
        } catch (err) {
          console.log(err);
        }
      };
      fetchList();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [props.chatBotId]);

  React.useEffect(() => {
    if (activeStep === isNameEdit) {
      setIsStepContent(false);
    } else {
      setIsStepContent(true);
    }
  }, [isNameEdit, activeStep]);

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleOptionChangeType = (event, index) => {
    // values[index].queueType = event.target.value;
    // updateOptions();
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/chatbot/${queueId}`);
      const { data } = await api.get(`/chatbot/${props.chatBotId}`);
      setSteps(initialState);
      setSteps(data);
      setIsNamedEdit(null);
      setGreetingMessageEdit(null);
      setSteps(data);
      toast.success(i18n.t("Queue deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("Tem certeza? Todas as opções internas também serão excluídas")}
      </ConfirmationModal>

      {!loading && (
        <div>
          <Formik
            initialValues={steps}
            validateOnChange={false}
            enableReinitialize={true}
            validationSchema={QueueSchema}
            render={({
              touched,
              errors,
              isSubmitting,
              values,
              handleSubmit,
            }) => (
              <FieldArray name="options">
                {({ push, remove }) => (
                  <>
                    <Stepper
                      nonLinear
                      activeStep={activeStep}
                      orientation="vertical"
                    >
                      {values.options &&
                        values.options.length > 0 &&
                        values.options.map((info, index) => (
                          <Step
                            key={`${info.id ? info.id : index}-options`}
                            onClick={() => setActiveStep(index)}
                          >
                            <StepLabel key={`${info.id}-options`}>
                              {isNameEdit !== index &&
                                steps.options[index]?.name ? (
                                <div
                                  className={classes.greetingMessage}
                                  variant="body1"
                                >
                                  {values.options[index].name}

                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setIsNamedEdit(index);
                                      setIsStepContent(false);
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>

                                  <IconButton
                                    onClick={() => {
                                      setSelectedQueue(info);
                                      setConfirmModalOpen(true);
                                    }}
                                    size="small"
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </div>
                              ) : (
                                <>
                                  <Field
                                    as={TextField}
                                    name={`options[${index}].name`}
                                    variant="standard"
                                    color="primary"
                                    disabled={isSubmitting}
                                    autoFocus
                                    error={
                                      touched?.options?.[index]?.name &&
                                      Boolean(errors.options?.[index]?.name)
                                    }
                                    className={classes.textField}
                                  />

                                  <FormControlLabel
                                    control={
                                      <>
                                        <InputLabel
                                          style={{ width: "70%" }}
                                        >{"Selecione uma opção"}</InputLabel>
                                        <Field
                                          as={Select}
                                          name={`options[${index}].queueType`}
                                          error={touched?.options?.[index]?.queueType &&
                                            Boolean(errors?.options?.[index]?.queueType)}
                                          helpertext={touched?.options?.[index]?.queueType && errors?.options?.[index]?.queueType}
                                          // value={`chatbots[${index}].queueType`}
                                          className={classes.textField1}
                                        >
                                          <MenuItem value={"text"}>Texto</MenuItem>
                                          <MenuItem value={"attendent"}>Atendente</MenuItem>
                                          <MenuItem value={"queue"}>Fila</MenuItem>
                                          <MenuItem value={"integration"}>Integração</MenuItem>
                                          <MenuItem value={"file"}>Arquivo</MenuItem>
                                        </Field>
                                        <FormControlLabel
                                          control={
                                            <Field
                                              as={Switch}
                                              color="primary"
                                              name={`options[${index}].closeTicket`}
                                              checked={values.options[index].closeTicket || false}
                                            />
                                          }
                                          label={i18n.t("queueModal.form.closeTicket")}
                                        />
                                      </>
                                    }
                                  />

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      values.options[index].name
                                        ? handleSaveBot(values)
                                        : null
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <SaveIcon />
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() => remove(index)}
                                    disabled={isSubmitting}
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </>
                              )}
                            </StepLabel>

                            {isStepContent && steps.options[index] && (
                              <StepContent>
                                <>
                                  <CustomToolTip
                                    title="A mensagem é obrigatória para seguir ao próximo nível"
                                    content="Se a mensagem não estiver definida, o bot não seguirá adiante"
                                  >
                                    <HelpOutlineOutlinedIcon
                                      color="secondary"
                                      style={{ marginLeft: "4px" }}
                                      fontSize="small"
                                    />
                                  </CustomToolTip>
                                  {isGreetingMessageEdit !== index ? (
                                    <div className={classes.greetingMessage}>
                                      <Typography
                                        color="textSecondary"
                                        variant="body1"
                                      >
                                        Message:
                                      </Typography>

                                      {values.options[index].greetingMessage}

                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setGreetingMessageEdit(index)
                                        }
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </div>
                                  ) : (
                                    <div
                                      className={classes.greetingMessage}
                                    >
                                      {steps.options[index].queueType === "text" && (
                                        <>
                                          <Field
                                            as={TextField}
                                            name={`options[${index}].greetingMessage`}
                                            variant="standard"
                                            margin="dense"
                                            fullWidth
                                            multiline
                                            error={
                                              touched.greetingMessage &&
                                              Boolean(errors.greetingMessage)
                                            }
                                            helperText={
                                              touched.greetingMessage &&
                                              errors.greetingMessage
                                            }
                                            className={classes.textField}
                                          />

                                        </>
                                      )}
                                      {steps.options[index].queueType === "queue" && (
                                        <>
                                          <Field
                                            as={TextField}
                                            name={`options[${index}].greetingMessage`}
                                            variant="standard"
                                            margin="dense"
                                            fullWidth
                                            multiline
                                            error={
                                              touched.greetingMessage &&
                                              Boolean(errors.greetingMessage)
                                            }
                                            helperText={
                                              touched.greetingMessage &&
                                              errors.greetingMessage
                                            }
                                            className={classes.textField}
                                          />
                                          <InputLabel>{"Selecione uma Fila"}</InputLabel>
                                          <Field
                                            as={Select}
                                            name={`options[${index}].optQueueId`}
                                            error={touched?.options?.[index]?.optQueueId &&
                                              Boolean(errors?.options?.[index]?.optQueueId)}
                                            helpertext={touched?.options?.[index]?.optQueueId && errors?.options?.[index]?.optQueueId}
                                            // value={`options[${index}].optQueueId`}
                                            className={classes.textField1}
                                          >
                                            {queues.map(queue => (
                                              <MenuItem key={queue.id} value={queue.id}>
                                                {queue.name}
                                              </MenuItem>
                                            ))}
                                          </Field>
                                        </>
                                      )}
                                      {steps.options[index].queueType === "attendent" && (
                                        <>
                                          <Field
                                            as={TextField}
                                            name={`options[${index}].greetingMessage`}
                                            variant="standard"
                                            margin="dense"
                                            fullWidth
                                            multiline
                                            error={
                                              touched.greetingMessage &&
                                              Boolean(errors.greetingMessage)
                                            }
                                            helperText={
                                              touched.greetingMessage &&
                                              errors.greetingMessage
                                            }
                                            className={classes.textField}
                                          />
                                          <InputLabel>{"Selecione uma Usuário"}</InputLabel>
                                          <Field
                                            as={Select}
                                            name={`options[${index}].optUserId`}
                                            error={touched?.options?.[index]?.optUserId &&
                                              Boolean(errors?.options?.[index]?.optUserId)}
                                            helpertext={touched?.options?.[index]?.optUserId && errors?.options?.[index]?.optUserId}
                                            // value={`options[${index}].optQueueId`}
                                            className={classes.textField1}
                                          >
                                            {users.map(user => (
                                              <MenuItem key={user.id} value={user.id}>
                                                {user.name}
                                              </MenuItem>
                                            ))}
                                          </Field>
                                          <InputLabel>{"Selecione uma Fila"}</InputLabel>
                                          <Field
                                            as={Select}
                                            name={`options[${index}].optQueueId`}
                                            error={touched?.options?.[index]?.optQueueId &&
                                              Boolean(errors?.options?.[index]?.optQueueId)}
                                            helpertext={touched?.options?.[index]?.optQueueId && errors?.options?.[index]?.optQueueId}
                                            // value={`options[${index}].optQueueId`}
                                            className={classes.textField1}
                                          >
                                            {queues.map(queue => (
                                              <MenuItem key={queue.id} value={queue.id}>
                                                {queue.name}
                                              </MenuItem>
                                            ))}
                                          </Field>
                                        </>
                                      )}
                                      {steps.options[index].queueType === "integration" && (
                                        <>
                                          <Field
                                            as={TextField}
                                            name={`options[${index}].greetingMessage`}
                                            variant="standard"
                                            margin="dense"
                                            fullWidth
                                            multiline
                                            error={
                                              touched.greetingMessage &&
                                              Boolean(errors.greetingMessage)
                                            }
                                            helperText={
                                              touched.greetingMessage &&
                                              errors.greetingMessage
                                            }
                                            className={classes.textField}
                                          />
                                          <InputLabel>{"Selecione uma Integração"}</InputLabel>
                                          <Field
                                            as={Select}
                                            name={`options[${index}].optIntegrationId`}
                                            error={touched?.options?.[index]?.optIntegrationId &&
                                              Boolean(errors?.options?.[index]?.optIntegrationId)}
                                            helpertext={touched?.options?.[index]?.optIntegrationId && errors?.options?.[index]?.optIntegrationId}
                                            // value={`options[${index}].optQueueId`}
                                            className={classes.textField1}
                                          >
                                            {integrations.map(integration => (
                                              <MenuItem key={integration.id} value={integration.id}>
                                                {integration.name}
                                              </MenuItem>
                                            ))}
                                          </Field>
                                        </>
                                      )}
                                      {steps.options[index].queueType === "file" && (
                                        <>
                                          <Field
                                            as={TextField}
                                            name={`options[${index}].greetingMessage`}
                                            variant="standard"
                                            margin="dense"
                                            fullWidth
                                            multiline
                                            error={
                                              touched.greetingMessage &&
                                              Boolean(errors.greetingMessage)
                                            }
                                            helperText={
                                              touched.greetingMessage &&
                                              errors.greetingMessage
                                            }
                                            className={classes.textField}
                                          />
                                          <InputLabel>{"Selecione um Arquivo"}</InputLabel>
                                          <Field
                                            as={Select}
                                            name={`options[${index}].optFileId`}
                                            error={touched?.options?.[index]?.optFileId &&
                                              Boolean(errors?.options?.[index]?.optFileId)}
                                            helpertext={touched?.options?.[index]?.optFileId && errors?.options?.[index]?.optFileId}
                                            // value={`options[${index}].optQueueId`}
                                            className={classes.textField1}
                                          >
                                            {file.map(f => (
                                              <MenuItem key={f.id} value={f.id}>
                                                {f.name}
                                              </MenuItem>
                                            ))}
                                          </Field>
                                        </>
                                      )}

                                      <IconButton
                                        size="small"
                                        onClick={() => handleSaveBot(values)}
                                        disabled={isSubmitting}
                                      >
                                        {" "}
                                        <SaveIcon />
                                      </IconButton>
                                    </div>
                                  )}

                                  {getStepContent(info.id)}
                                </>
                              </StepContent>
                            )}
                          </Step>
                        ))}

                      <Step>
                        <StepLabel
                          onClick={() =>
                            push({
                              name: undefined,
                              greetingMessage: undefined,
                            })
                          }
                        >
                          {i18n.t("fileModal.buttons.fileOptions")}
                        </StepLabel>
                      </Step>
                    </Stepper>
                  </>
                )}
              </FieldArray>
            )}
          />
        </div>
      )}
    </div>
  );
}
