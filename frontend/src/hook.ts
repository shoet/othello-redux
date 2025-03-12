import { useSelector } from "react-redux";
import { AppDispatch, RootAppState } from "./store";
import { useDispatch } from "react-redux";

export const useAppSelector = useSelector.withTypes<RootAppState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
